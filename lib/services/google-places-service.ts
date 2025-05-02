"use server"

// Google Places API service for searching and retrieving business information
// This is now a server-side only service

// Note: API key is accessed server-side only
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""

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
    // Build the search query
    const searchQuery = query || "ice cream"
    let url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery,
    )}&key=${GOOGLE_MAPS_API_KEY}`

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

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${GOOGLE_MAPS_API_KEY}`

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
 * Get a photo URL from a photo reference
 * This is now a server-side function that will proxy the image
 */
export async function getPhotoUrl(photoReference: string, maxWidth = 400): Promise<string> {
  // Return a URL to our own API endpoint that will proxy the image
  return `/api/maps/photo?reference=${photoReference}&maxwidth=${maxWidth}`
}

/**
 * Convert Google Places business to our shop format
 */
export async function convertPlaceToShop(place: PlaceDetails) {
  // Extract address components
  const addressParts = place.formatted_address.split(", ")
  const address = addressParts[0]
  const cityState = addressParts[1]?.split(" ") || []
  const city = cityState.slice(0, -1).join(" ")
  const state = cityState[cityState.length - 1]

  // Get the first photo if available
  const imageUrl = place.photos && place.photos.length > 0 ? await getPhotoUrl(place.photos[0].photo_reference) : null

  // Create a description from available information
  let description = ""
  if (place.editorial_summary?.overview) {
    description = place.editorial_summary.overview
  } else if (place.reviews && place.reviews.length > 0) {
    // Use the highest rated review as a description if no editorial summary
    const highestRatedReview = [...place.reviews].sort((a, b) => b.rating - a.rating)[0]
    description = `${highestRatedReview.text.substring(0, 200)}${highestRatedReview.text.length > 200 ? "..." : ""}`
  }

  return {
    name: place.name,
    address,
    city,
    state,
    lat: place.geometry.location.lat,
    lng: place.geometry.location.lng,
    phone: place.formatted_phone_number || null,
    website: place.website || null,
    description,
    image_url: imageUrl,
    // Additional fields that would need to be filled in later
    owner_id: null,
    is_verified: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
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
 * Check if a shop already exists in the database
 */
export async function isDuplicateShop(existingShops: any[], newShop: any): Promise<boolean> {
  return existingShops.some((shop) => shop.name === newShop.name && shop.address === newShop.address)
}
