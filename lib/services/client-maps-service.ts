"use client"

/**
 * Client-side service for Google Maps API
 * This service makes API calls to our server endpoints instead of directly using Google APIs
 */

// Function to search for nearby ice cream shops
export async function searchNearbyIceCreamShops(lat: number, lng: number, radius = 5000) {
  try {
    const response = await fetch(`/api/maps/proxy/nearby?lat=${lat}&lng=${lng}&radius=${radius}`)
    if (!response.ok) throw new Error("Failed to fetch nearby shops")
    const data = await response.json()
    return data.results || []
  } catch (error) {
    console.error("Error searching nearby shops:", error)
    return []
  }
}

// Function to get details for a specific place
export async function getPlaceDetails(placeId: string) {
  try {
    const response = await fetch(`/api/maps/proxy/details?place_id=${placeId}`)
    if (!response.ok) throw new Error("Failed to fetch place details")
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error getting place details:", error)
    return null
  }
}

// Function to get a photo URL for a place
export function getPlacePhotos(photoReference: string, maxWidth = 400) {
  return `/api/maps/photo?photo_reference=${photoReference}&maxwidth=${maxWidth}`
}

// Function to geocode an address
export async function geocodeAddress(address: string) {
  try {
    const response = await fetch(`/api/maps/proxy/geocode?address=${encodeURIComponent(address)}`)
    if (!response.ok) throw new Error("Failed to geocode address")
    const data = await response.json()

    if (data.results && data.results.length > 0) {
      const location = data.results[0].geometry.location
      return {
        lat: location.lat,
        lng: location.lng,
        formatted_address: data.results[0].formatted_address,
      }
    }
    return null
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

// Function for place autocomplete
export async function autocompletePlaceSearch(input: string, sessionToken = "") {
  try {
    const response = await fetch(
      `/api/maps/proxy/autocomplete?input=${encodeURIComponent(input)}&sessiontoken=${sessionToken}`,
    )
    if (!response.ok) throw new Error("Failed to get autocomplete results")
    const data = await response.json()
    return data.predictions || []
  } catch (error) {
    console.error("Error getting autocomplete results:", error)
    return []
  }
}
