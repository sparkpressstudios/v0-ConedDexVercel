"use server"

import { createClient } from "@/lib/supabase/server"

// Get the API key from server environment - renamed to non-public version
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || ""

// Check if Maps API is configured
export async function isMapsApiConfigured() {
  return !!GOOGLE_MAPS_API_KEY
}

/**
 * Server action to get the Google Maps API URL with the API key
 * This keeps the API key secure on the server
 */
export async function getMapsApiUrl() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key not configured")
    return null
  }

  // Return the URL to our loader endpoint which will inject the key securely
  return "/api/maps/loader"
}

// Search for shops near a location
export async function searchShopsNearLocation(lat: number, lng: number, radius = 50000) {
  try {
    // Use Supabase for geospatial queries instead of direct Google API calls
    const supabase = createClient()

    // This is a simplified example - in a real app, you'd implement proper geospatial queries
    const { data, error } = await supabase.from("shops").select("*")

    if (error) throw error

    // Filter shops by distance (simplified)
    return data.filter((shop) => {
      const distance = calculateDistance(lat, lng, shop.lat, shop.lng)
      return distance <= radius / 1000 // Convert meters to km
    })
  } catch (error) {
    console.error("Error searching shops:", error)
    return []
  }
}

// Helper function to calculate distance between coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}
