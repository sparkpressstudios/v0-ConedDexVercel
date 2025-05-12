"use server"

import { headers } from "next/headers"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Shop } from "@/types/shop"

// Rate limiting configuration
const RATE_LIMIT = {
  REQUESTS_PER_SECOND: 10,
  DAILY_QUOTA: 1000,
  COOLDOWN_MS: 100, // 100ms between requests
}

// Cache configuration
const CACHE_TTL = 60 * 60 * 1000 // 1 hour in milliseconds

// Types for Google Places API responses
export interface PlaceSearchResult {
  place_id: string
  name: string
  vicinity: string
  formatted_address?: string
  types: string[]
  business_status: string
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: {
    photo_reference: string
    height: number
    width: number
  }[]
  rating?: number
  user_ratings_total?: number
  price_level?: number
  permanently_closed?: boolean
  opening_hours?: {
    open_now?: boolean
  }
}

export interface PlaceDetails {
  place_id: string
  name: string
  formatted_address: string
  formatted_phone_number?: string
  international_phone_number?: string
  website?: string
  rating?: number
  url?: string
  types: string[]
  opening_hours?: {
    weekday_text: string[]
    open_now?: boolean
    periods?: {
      open: {
        day: number
        time: string
      }
      close?: {
        day: number
        time: string
      }
    }[]
  }
  photos?: {
    photo_reference: string
    height: number
    width: number
  }[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  reviews?: {
    author_name: string
    rating: number
    text: string
    time: number
  }[]
  price_level?: number
  editorial_summary?: {
    overview: string
  }
  permanently_closed?: boolean
  business_status?: string
}

export interface SearchOptions {
  query?: string
  location?: {
    lat: number
    lng: number
  }
  radius?: number
  type?: string
  minPrice?: number
  maxPrice?: number
  openNow?: boolean
  rankBy?: "prominence" | "distance"
  keyword?: string
  nextPageToken?: string
}

export interface FilterOptions {
  includeKeywords?: string[]
  excludeKeywords?: string[]
  minRating?: number
  minReviews?: number
  businessTypes?: string[]
  excludeTypes?: string[]
  onlyOpenBusinesses?: boolean
}

// In-memory cache for API responses
const apiCache = new Map<string, { data: any; timestamp: number }>()

// In-memory rate limiting
let requestCount = 0
let lastRequestTime = Date.now()
let dailyRequestCount = 0
let dailyResetDate = new Date().setHours(0, 0, 0, 0)

/**
 * Reset rate limiting counters if needed
 */
function checkAndResetRateLimits() {
  const now = Date.now()

  // Reset daily counter if it's a new day
  const today = new Date().setHours(0, 0, 0, 0)
  if (today !== dailyResetDate) {
    dailyRequestCount = 0
    dailyResetDate = today
  }

  // Reset per-second counter if more than a second has passed
  if (now - lastRequestTime > 1000) {
    requestCount = 0
    lastRequestTime = now
  }
}

/**
 * Check if we're within rate limits
 */
function withinRateLimits(): boolean {
  checkAndResetRateLimits()
  return requestCount < RATE_LIMIT.REQUESTS_PER_SECOND && dailyRequestCount < RATE_LIMIT.DAILY_QUOTA
}

/**
 * Throttle API requests to stay within rate limits
 */
async function throttledRequest(url: string, options?: RequestInit): Promise<Response> {
  // Check cache first
  const cacheKey = url + JSON.stringify(options || {})
  const cachedResponse = apiCache.get(cacheKey)

  if (cachedResponse && Date.now() - cachedResponse.timestamp < CACHE_TTL) {
    return new Response(JSON.stringify(cachedResponse.data), {
      headers: { "Content-Type": "application/json" },
    })
  }

  // Wait for rate limit cooldown
  while (!withinRateLimits()) {
    await new Promise((resolve) => setTimeout(resolve, RATE_LIMIT.COOLDOWN_MS))
  }

  // Update counters
  requestCount++
  dailyRequestCount++
  lastRequestTime = Date.now()

  // Make the actual request
  const response = await fetch(url, options)

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`)
  }

  // Cache the response
  const data = await response.json()
  apiCache.set(cacheKey, { data, timestamp: Date.now() })

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Search for places using Google Places API with advanced options
 */
export async function searchPlaces(
  options: SearchOptions,
): Promise<{ results: PlaceSearchResult[]; nextPageToken?: string }> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    // Build the search URL
    let url: string

    // Use text search or nearby search based on provided options
    if (options.query) {
      // Text search
      url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(options.query)}&key=${apiKey}`
    } else if (options.location) {
      // Nearby search
      url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${options.location.lat},${options.location.lng}&key=${apiKey}`

      // Can't use both rankBy=distance and radius
      if (options.rankBy === "distance") {
        url += `&rankby=distance`
      } else {
        url += `&radius=${options.radius || 5000}`
      }
    } else {
      throw new Error("Either query or location must be provided")
    }

    // Add optional parameters
    if (options.type) {
      url += `&type=${options.type}`
    }

    if (options.keyword) {
      url += `&keyword=${encodeURIComponent(options.keyword)}`
    }

    if (options.minPrice !== undefined) {
      url += `&minprice=${options.minPrice}`
    }

    if (options.maxPrice !== undefined) {
      url += `&maxprice=${options.maxPrice}`
    }

    if (options.openNow) {
      url += `&opennow=true`
    }

    if (options.nextPageToken) {
      url += `&pagetoken=${options.nextPageToken}`
    }

    // Make the throttled request
    const response = await throttledRequest(url)
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data)
      throw new Error(`Google Places API error: ${data.status}`)
    }

    return {
      results: data.results || [],
      nextPageToken: data.next_page_token,
    }
  } catch (error) {
    console.error("Error searching places:", error)
    throw error
  }
}

/**
 * Get detailed information about a place using its place_id
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    const fields = [
      "place_id",
      "name",
      "formatted_address",
      "formatted_phone_number",
      "international_phone_number",
      "website",
      "rating",
      "url",
      "types",
      "opening_hours",
      "photos",
      "geometry",
      "reviews",
      "price_level",
      "editorial_summary",
      "business_status",
      "permanently_closed",
    ].join(",")

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`

    // Make the throttled request
    const response = await throttledRequest(url)
    const data = await response.json()

    if (data.status !== "OK") {
      console.error("Google Places API error:", data)
      throw new Error(`Google Places API error: ${data.status}`)
    }

    return data.result
  } catch (error) {
    console.error("Error getting place details:", error)
    throw error
  }
}

/**
 * Get the URL for a Google Places photo
 */
export async function getPhotoUrl(photoReference: string, maxWidth = 400): Promise<string> {
  const headersList = headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"

  // Return proxy URL to our own API that will fetch the photo
  return `${protocol}://${host}/api/maps/photo?reference=${photoReference}&maxwidth=${maxWidth}`
}

/**
 * Apply intelligent filtering to identify ice cream shops
 */
export async function filterIceCreamShops(
  places: PlaceSearchResult[],
  options: FilterOptions = {},
): Promise<PlaceSearchResult[]> {
  // Default ice cream related keywords if none provided
  const includeKeywords = options.includeKeywords || [
    "ice cream",
    "gelato",
    "frozen yogurt",
    "soft serve",
    "sorbet",
    "frozen dessert",
    "creamery",
    "dairy",
    "scoop",
  ]

  // Default exclusion keywords if none provided
  const excludeKeywords = options.excludeKeywords || [
    "convenience store",
    "grocery",
    "supermarket",
    "gas station",
    "department store",
  ]

  // Ice cream shop types from Google Places
  const iceCreamTypes = options.businessTypes || ["ice_cream_shop", "food", "restaurant", "cafe", "bakery", "store"]

  // Types to exclude
  const excludeTypes = options.excludeTypes || [
    "gas_station",
    "convenience_store",
    "department_store",
    "grocery_or_supermarket",
    "liquor_store",
  ]

  return places.filter((place) => {
    // Skip permanently closed places if specified
    if (options.onlyOpenBusinesses && (place.permanently_closed || place.business_status === "CLOSED_PERMANENTLY")) {
      return false
    }

    // Skip places with low ratings if specified
    if (options.minRating && place.rating && place.rating < options.minRating) {
      return false
    }

    // Skip places with few reviews if specified
    if (options.minReviews && place.user_ratings_total && place.user_ratings_total < options.minReviews) {
      return false
    }

    // Combine all text fields for searching
    const shopText = [place.name, place.vicinity || place.formatted_address || "", ...(place.types || [])]
      .join(" ")
      .toLowerCase()

    // Check if any keywords match
    const hasIceCreamKeyword = includeKeywords.some((keyword) => shopText.includes(keyword.toLowerCase()))

    // Check if any exclusion keywords match
    const hasExclusionKeyword = excludeKeywords.some((keyword) => shopText.includes(keyword.toLowerCase()))

    // Check if place has an ice cream related type
    const hasIceCreamType = place.types && place.types.some((type) => iceCreamTypes.includes(type))

    // Check if place has an excluded type
    const hasExcludedType = place.types && place.types.some((type) => excludeTypes.includes(type))

    // Calculate a relevance score (higher is better)
    let relevanceScore = 0

    // Boost score for places with ice cream in the name
    if (place.name.toLowerCase().includes("ice cream") || place.name.toLowerCase().includes("gelato")) {
      relevanceScore += 5
    }

    // Boost score for places with ice cream shop type
    if (place.types && place.types.includes("ice_cream_shop")) {
      relevanceScore += 5
    }

    // Boost score for each matching keyword
    includeKeywords.forEach((keyword) => {
      if (shopText.includes(keyword.toLowerCase())) {
        relevanceScore += 1
      }
    })

    // Reduce score for each exclusion keyword
    excludeKeywords.forEach((keyword) => {
      if (shopText.includes(keyword.toLowerCase())) {
        relevanceScore -= 2
      }
    })

    // Return true if it's likely an ice cream shop and not excluded
    return (hasIceCreamKeyword || hasIceCreamType) && !hasExclusionKeyword && !hasExcludedType && relevanceScore > 0
  })
}

/**
 * Convert a Google Place to a Shop object with enhanced data
 */
export async function convertPlaceToShop(place: PlaceDetails): Promise<Partial<Shop>> {
  // Process images - get multiple sizes for different use cases
  let mainImage = null
  let thumbnailImage = null
  const additionalImages: string[] = []

  if (place.photos && place.photos.length > 0) {
    // Get the first photo as main image (high quality)
    mainImage = await getPhotoUrl(place.photos[0].photo_reference, 800)

    // Get a smaller version for thumbnails
    thumbnailImage = await getPhotoUrl(place.photos[0].photo_reference, 200)

    // Get additional images (up to 5)
    const photoLimit = Math.min(place.photos.length, 5)
    for (let i = 1; i < photoLimit; i++) {
      additionalImages.push(await getPhotoUrl(place.photos[i].photo_reference, 600))
    }
  }

  // Extract business hours in a structured format
  const businessHours = {}
  let openingHoursText = ""

  if (place.opening_hours?.weekday_text) {
    openingHoursText = place.opening_hours.weekday_text.join("\n")

    // Parse structured hours if available
    if (place.opening_hours.periods) {
      const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

      place.opening_hours.periods.forEach((period) => {
        const day = daysOfWeek[period.open.day]
        const openTime = period.open.time.replace(/(\d{2})(\d{2})/, "$1:$2")
        const closeTime = period.close ? period.close.time.replace(/(\d{2})(\d{2})/, "$1:$2") : "24:00"

        businessHours[day.toLowerCase()] = {
          open: openTime,
          close: closeTime,
          is24Hours: !period.close,
        }
      })
    }
  }

  // Try to extract a better description from reviews if editorial summary is missing
  let description = place.editorial_summary?.overview || ""
  if (!description && place.reviews && place.reviews.length > 0) {
    // Use the highest rated review as a potential description
    const sortedReviews = [...place.reviews].sort((a, b) => b.rating - a.rating)
    if (sortedReviews[0].text && sortedReviews[0].text.length > 30) {
      description = `Customer review: ${sortedReviews[0].text.substring(0, 150)}...`
    }
  }

  // Determine business type
  const businessType = await categorizeBusinessType(place)

  // Check if business is active
  const isActive = place.business_status !== "CLOSED_PERMANENTLY" && !place.permanently_closed

  return {
    name: place.name,
    description: description,
    address: place.formatted_address || "",
    phone: place.formatted_phone_number || "",
    website: place.website || "",
    googlePlaceId: place.place_id,
    googleUrl: place.url || "",
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    rating: place.rating,
    reviewCount: place.reviews?.length || 0,
    mainImage: mainImage,
    thumbnailImage: thumbnailImage,
    additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
    isVerified: false,
    isActive: isActive,
    priceLevel: place.price_level || 2,
    openingHours: openingHoursText,
    businessHours: Object.keys(businessHours).length > 0 ? JSON.stringify(businessHours) : null,
    source: "google_places",
    importedAt: new Date().toISOString(),
    businessType: businessType,
    lastUpdated: new Date().toISOString(),
  }
}

/**
 * Categorize the business type based on place data
 */
export async function categorizeBusinessType(place: any): Promise<string> {
  const name = place.name?.toLowerCase() || ""
  const types = place.types || []

  // Direct matches from Google Places types
  if (types.includes("ice_cream_shop")) return "ice_cream_shop"

  // Name-based categorization
  if (name.includes("gelato")) return "gelato"
  if (name.includes("frozen yogurt") || name.includes("froyo")) return "frozen_yogurt"
  if (name.includes("sorbet")) return "sorbet"
  if (name.includes("ice cream")) return "ice_cream_shop"

  // Type-based categorization
  if (types.includes("cafe")) return "cafe_with_ice_cream"
  if (types.includes("restaurant")) return "restaurant_with_ice_cream"
  if (types.includes("bakery")) return "bakery_with_ice_cream"
  if (types.includes("food")) return "food_with_ice_cream"

  return "ice_cream_shop" // Default
}

/**
 * Check if a shop with the same Google Place ID already exists
 */
export async function isDuplicateShop(placeId: string): Promise<boolean> {
  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase.from("shops").select("id").eq("googlePlaceId", placeId).limit(1)

  if (error) {
    console.error("Error checking for duplicate shop:", error)
    return false
  }

  return data && data.length > 0
}

/**
 * Validate shop data before importing
 */
export async function validateShopData(shop: Partial<Shop>): Promise<{ valid: boolean; errors: string[] }> {
  const errors: string[] = []

  // Required fields
  if (!shop.name) errors.push("Shop name is required")
  if (!shop.address) errors.push("Shop address is required")
  if (!shop.googlePlaceId) errors.push("Google Place ID is required")
  if (!shop.latitude || !shop.longitude) errors.push("Shop location coordinates are required")

  // Validate coordinates
  if (shop.latitude && (shop.latitude < -90 || shop.latitude > 90)) {
    errors.push("Invalid latitude value")
  }

  if (shop.longitude && (shop.longitude < -180 || shop.longitude > 180)) {
    errors.push("Invalid longitude value")
  }

  // Validate URLs
  if (shop.website && !isValidUrl(shop.website)) {
    errors.push("Invalid website URL")
  }

  if (shop.mainImage && !isValidUrl(shop.mainImage)) {
    errors.push("Invalid main image URL")
  }

  // Check for duplicate
  if (shop.googlePlaceId && (await isDuplicateShop(shop.googlePlaceId))) {
    errors.push("Shop with this Google Place ID already exists")
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate a URL
 */
function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Geocode an address to get coordinates
 */
export async function geocodeAddress(
  address: string,
): Promise<{ lat: number; lng: number; formattedAddress: string } | null> {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    const encodedAddress = encodeURIComponent(address)
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`

    // Make the throttled request
    const response = await throttledRequest(url)
    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      throw new Error(`Geocoding failed: ${data.status}`)
    }

    const location = data.results[0].geometry.location
    return {
      lat: location.lat,
      lng: location.lng,
      formattedAddress: data.results[0].formatted_address,
    }
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

/**
 * Get nearby ice cream shops using Google Places API
 */
export async function findNearbyIceCreamShops(
  lat: number,
  lng: number,
  radius = 5000,
  filterOptions: FilterOptions = {},
): Promise<PlaceSearchResult[]> {
  try {
    // Search for nearby ice cream shops
    const { results } = await searchPlaces({
      location: { lat, lng },
      radius,
      keyword: "ice cream",
      type: "food",
    })

    // Apply intelligent filtering
    return await filterIceCreamShops(results, filterOptions)
  } catch (error) {
    console.error("Error finding nearby ice cream shops:", error)
    return []
  }
}

/**
 * Search for ice cream shops by query
 */
export async function searchIceCreamShops(
  query: string,
  filterOptions: FilterOptions = {},
): Promise<PlaceSearchResult[]> {
  try {
    // Enhance the query to focus on ice cream
    const enhancedQuery = query.toLowerCase().includes("ice cream") ? query : `ice cream ${query}`

    // Search for ice cream shops
    const { results } = await searchPlaces({
      query: enhancedQuery,
      type: "food",
    })

    // Apply intelligent filtering
    return await filterIceCreamShops(results, filterOptions)
  } catch (error) {
    console.error("Error searching for ice cream shops:", error)
    return []
  }
}
