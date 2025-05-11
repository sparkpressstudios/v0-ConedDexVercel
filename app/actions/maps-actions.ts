"use server"

import {
  searchIceCreamBusinesses,
  getPlaceDetails,
  convertPlaceToShop,
  isDuplicateShop,
  type PlaceSearchResult,
  type PlaceDetails,
} from "@/lib/services/google-places-service"

/**
 * Server action to search for ice cream shops
 */
export async function searchShops(
  query: string,
  lat?: number,
  lng?: number,
  radius?: number,
): Promise<{ results: PlaceSearchResult[]; nextPageToken?: string }> {
  try {
    const location = lat && lng ? { lat, lng } : undefined
    return await searchIceCreamBusinesses(query, location, radius)
  } catch (error) {
    console.error("Error in searchShops server action:", error)
    throw new Error("Failed to search for shops")
  }
}

/**
 * Server action to get shop details
 */
export async function getShopDetails(placeId: string): Promise<PlaceDetails> {
  try {
    return await getPlaceDetails(placeId)
  } catch (error) {
    console.error("Error in getShopDetails server action:", error)
    throw new Error("Failed to get shop details")
  }
}

/**
 * Server action to convert place to shop
 */
export async function convertPlaceToShopAction(place: PlaceDetails) {
  try {
    return await convertPlaceToShop(place)
  } catch (error) {
    console.error("Error in convertPlaceToShopAction:", error)
    throw new Error("Failed to convert place to shop")
  }
}

/**
 * Server action to check for duplicate shops
 */
export async function checkDuplicateShop(existingShops: any[], newShop: any): Promise<boolean> {
  try {
    return await isDuplicateShop(existingShops, newShop)
  } catch (error) {
    console.error("Error in checkDuplicateShop:", error)
    throw new Error("Failed to check for duplicate shop")
  }
}

/**
 * Server action to get map configuration
 */
export async function getMapConfiguration(): Promise<{ configured: boolean }> {
  // Check if the API key is configured
  const apiKey = process.env.GOOGLE_MAPS_API_KEY
  return { configured: !!apiKey }
}
