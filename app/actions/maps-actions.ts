"use server"

import { getPlaceDetails, searchIceCreamBusinesses } from "@/lib/services/google-places-service"

/**
 * Server action to search for ice cream businesses
 * This keeps the API key secure on the server
 */
export async function searchShops(query: string, lat?: number, lng?: number, radius?: number) {
  try {
    const location = lat && lng ? { lat, lng } : undefined
    const result = await searchIceCreamBusinesses(query, location, radius)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error searching shops:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Server action to get details for a specific place
 * This keeps the API key secure on the server
 */
export async function getShopDetails(placeId: string) {
  try {
    const result = await getPlaceDetails(placeId)
    return { success: true, data: result }
  } catch (error) {
    console.error("Error getting shop details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}
