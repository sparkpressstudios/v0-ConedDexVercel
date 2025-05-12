"use server"

// Google Places API service for searching and retrieving business information
// This is a server-side only service

import type { Shop } from "@/types/shop"
import { headers } from "next/headers"

export interface PlaceSearchResult {
  place_id: string
  name: string
  vicinity: string
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
}

/**
 * Search for ice cream businesses using Google Places API
 */
export async function searchIceCreamBusinesses(
  query: string,
  location?: { lat: number; lng: number },
  radius = 50000,
  nextPageToken?: string,
): Promise<{ results: PlaceSearchResult[]; nextPageToken?: string }> {
  try {
    // Server-side only access to the API key
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    // Build the search query
    const searchQuery = query || "ice cream"
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery,
    )}&key=${apiKey}`

    // Add location if provided
    if (location) {
      url += `&location=${location.lat},${location.lng}&radius=${radius}`
    }

    // Add page token if provided
    if (nextPageToken) {
      url += `&pagetoken=${nextPageToken}`
    }

    // Make the API request
    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      throw new Error(`Google Places API error: ${data.status}`)
    }

    return {
      results: data.results || [],
      nextPageToken: data.next_page_token,
    }
  } catch (error) {
    console.error("Error searching for ice cream businesses:", error)
    throw error
  }
}

/**
 * Get detailed information about a place using its place_id
 */
export async function getPlaceDetails(placeId: string): Promise<PlaceDetails> {
  try {
    // Server-side only access to the API key
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
    ].join(",")

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`

    const response = await fetch(url)
    const data = await response.json()

    if (data.status !== "OK") {
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
  return `/api/maps/photo?photoReference=${photoReference}&maxWidth=${maxWidth}`
}

/**
 * Convert a Google Place to a Shop object with enhanced image handling
 */
export async function convertPlaceToShop(place: any): Promise<Partial<Shop>> {
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

  // Try to extract a better description from reviews if editorial summary is missing
  let description = place.editorial_summary?.overview || ""
  if (!description && place.reviews && place.reviews.length > 0) {
    // Use the highest rated review as a potential description
    const sortedReviews = [...place.reviews].sort((a, b) => b.rating - a.rating)
    if (sortedReviews[0].text && sortedReviews[0].text.length > 30) {
      description = `Customer review: ${sortedReviews[0].text.substring(0, 150)}...`
    }
  }

  return {
    name: place.name,
    description: description,
    address: place.formatted_address || "",
    phone: place.formatted_phone_number || "",
    website: place.website || "",
    googlePlaceId: place.place_id,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    rating: place.rating,
    reviewCount: place.user_ratings_total || 0,
    mainImage: mainImage,
    thumbnailImage: thumbnailImage,
    additionalImages: additionalImages.length > 0 ? additionalImages : undefined,
    isVerified: false,
    isActive: true,
    priceLevel: place.price_level || 2,
    openingHours: place.opening_hours?.weekday_text?.join("\n") || "",
    source: "google_places",
    importedAt: new Date().toISOString(),
    // Add business type categorization
    businessType: await categorizeBusinessType(place),
  }
}

/**
 * Categorize the business type based on place data
 */
export async function categorizeBusinessType(place: any): Promise<string> {
  const name = place.name?.toLowerCase() || ""
  const types = place.types || []

  if (types.includes("ice_cream_shop")) return "ice_cream_shop"

  if (name.includes("gelato")) return "gelato"
  if (name.includes("frozen yogurt") || name.includes("froyo")) return "frozen_yogurt"
  if (name.includes("sorbet")) return "sorbet"

  // Check for ice cream in the name
  if (name.includes("ice cream")) return "ice_cream_shop"

  // Default categorization based on Google types
  if (types.includes("cafe")) return "cafe_with_ice_cream"
  if (types.includes("restaurant")) return "restaurant_with_ice_cream"
  if (types.includes("bakery")) return "bakery_with_ice_cream"

  return "ice_cream_shop" // Default
}

/**
 * Get multiple photos for a place
 */
export async function getPlacePhotos(placeId: string, maxCount = 5): Promise<string[]> {
  try {
    const placeDetails = await getPlaceDetails(placeId)
    const photos = placeDetails.photos || []
    const photoUrls: string[] = []

    const photoLimit = Math.min(photos.length, maxCount)
    for (let i = 0; i < photoLimit; i++) {
      photoUrls.push(await getPhotoUrl(photos[i].photo_reference, 600))
    }

    return photoUrls
  } catch (error) {
    console.error("Error getting place photos:", error)
    return []
  }
}

/**
 * Batch search for ice cream businesses in multiple locations
 */
export async function batchSearchIceCreamBusinesses(
  locations: { name: string; lat: number; lng: number }[],
  radius = 25000,
): Promise<{ location: string; results: PlaceSearchResult[] }[]> {
  const results = []

  for (const location of locations) {
    try {
      const { results: locationResults } = await searchIceCreamBusinesses(
        "ice cream",
        { lat: location.lat, lng: location.lng },
        radius,
      )

      results.push({
        location: location.name,
        results: locationResults,
      })
    } catch (error) {
      console.error(`Error searching in ${location.name}:`, error)
      results.push({
        location: location.name,
        results: [],
      })
    }
  }

  return results
}

/**
 * Check if a shop with the same Google Place ID already exists
 */
export async function isDuplicateShop(placeId: string, supabase: any): Promise<boolean> {
  const { data, error } = await supabase.from("shops").select("id").eq("googlePlaceId", placeId).limit(1)

  if (error) {
    console.error("Error checking for duplicate shop:", error)
    return false
  }

  return data && data.length > 0
}

// Add any other necessary functions for the Google Places API service
// Get nearby ice cream shops using Google Places API
export async function searchNearbyIceCreamShops(lat: number, lng: number, radius = 5000) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=restaurant&keyword=ice%20cream&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error fetching nearby ice cream shops:", error)
    return []
  }
}

// Geocode an address to get coordinates
export async function geocodeAddress(address: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    const encodedAddress = encodeURIComponent(address)
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Google Geocoding API error: ${response.status}`)
    }

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

// Get place photos
export async function getPlacePhotosOld(photoReference: string, maxWidth = 400) {
  const headersList = headers()
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"

  // Return proxy URL to our own API that will fetch the photo
  return `${protocol}://${host}/api/maps/photo?reference=${photoReference}&maxwidth=${maxWidth}`
}

// Autocomplete place search
export async function autocompletePlaceSearch(input: string, sessionToken: string) {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      throw new Error("Google Maps API key is not configured")
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&types=establishment&sessiontoken=${sessionToken}&key=${apiKey}`,
    )

    if (!response.ok) {
      throw new Error(`Google Places Autocomplete API error: ${response.status}`)
    }

    const data = await response.json()
    return data.predictions || []
  } catch (error) {
    console.error("Error with place autocomplete:", error)
    return []
  }
}

// Intelligent filtering for ice cream shops
export async function isIceCreamShop(
  place: any,
  keywords: string[] = [],
  excludeKeywords: string[] = [],
): Promise<boolean> {
  // Default ice cream related keywords if none provided
  const iceCreamKeywords =
    keywords.length > 0 ? keywords : ["ice cream", "gelato", "frozen yogurt", "soft serve", "sorbet", "frozen dessert"]

  // Default exclusion keywords if none provided
  const exclusionKeywords =
    excludeKeywords.length > 0 ? excludeKeywords : ["convenience store", "grocery", "supermarket"]

  // Combine all text fields for searching
  const shopText = [place.name, place.vicinity || place.formatted_address, ...(place.types || [])]
    .join(" ")
    .toLowerCase()

  // Check if any keywords match
  const hasIceCreamKeyword = iceCreamKeywords.some((keyword) => shopText.includes(keyword.toLowerCase()))

  // Check if any exclusion keywords match
  const hasExclusionKeyword = exclusionKeywords.some((keyword) => shopText.includes(keyword.toLowerCase()))

  // Ice cream shop types from Google Places
  const iceCreamTypes = ["ice_cream_shop", "cafe", "food", "restaurant", "bakery"]
  const hasIceCreamType = place.types && place.types.some((type: string) => iceCreamTypes.includes(type))

  return (hasIceCreamKeyword || hasIceCreamType) && !hasExclusionKeyword
}
