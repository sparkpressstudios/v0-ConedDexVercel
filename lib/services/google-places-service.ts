"use server"

// Google Places API service for searching and retrieving business information
// This is a server-side only service

import type { Shop } from "@/types/shop"

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
 * Convert a Google Place to a Shop object
 */
export async function convertPlaceToShop(place: any): Promise<Partial<Shop>> {
  const mainPhoto =
    place.photos && place.photos.length > 0 ? await getPhotoUrl(place.photos[0].photo_reference, 800) : null

  return {
    name: place.name,
    description: place.editorial_summary?.overview || "",
    address: place.formatted_address || "",
    phone: place.formatted_phone_number || "",
    website: place.website || "",
    googlePlaceId: place.place_id,
    latitude: place.geometry?.location?.lat,
    longitude: place.geometry?.location?.lng,
    rating: place.rating,
    reviewCount: place.user_ratings_total || 0,
    mainImage: mainPhoto,
    isVerified: false,
    isActive: true,
    priceLevel: place.price_level || 2,
    openingHours: place.opening_hours?.weekday_text?.join("\n") || "",
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
