"use server"

import { createClient } from "@/lib/supabase/server"
import {
  searchIceCreamBusinesses,
  getPlaceDetails,
  convertPlaceToShop,
  batchSearchIceCreamBusinesses,
} from "@/lib/services/google-places-service"
import type { PlaceDetails } from "@/lib/services/google-places-service"

/**
 * Server action to search for ice cream businesses
 */
export async function searchBusinesses(
  query: string,
  location?: { lat: number; lng: number },
  radius = 50000,
  nextPageToken?: string,
) {
  try {
    const result = await searchIceCreamBusinesses(query, location, radius, nextPageToken)
    return { success: true, ...result }
  } catch (error) {
    console.error("Error searching for businesses:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      results: [],
    }
  }
}

/**
 * Server action to get details for a place
 */
export async function getBusinessDetails(placeId: string) {
  try {
    const details = await getPlaceDetails(placeId)
    return { success: true, details }
  } catch (error) {
    console.error("Error getting place details:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      details: null,
    }
  }
}

/**
 * Server action to import a shop to the database
 */
export async function importShopToDatabase(place: PlaceDetails) {
  try {
    const supabase = createClient()
    const shopData = await convertPlaceToShop(place)

    // Check if shop already exists
    const { data: existingShops } = await supabase
      .from("shops")
      .select("id")
      .eq("name", shopData.name)
      .eq("address", shopData.address)
      .limit(1)

    if (existingShops && existingShops.length > 0) {
      return {
        success: false,
        message: "This shop already exists in the database.",
      }
    }

    // Insert the new shop
    const { data, error } = await supabase.from("shops").insert([shopData]).select()

    if (error) throw error

    return {
      success: true,
      message: `Successfully imported ${shopData.name} to the database.`,
      shop: data[0],
    }
  } catch (error) {
    console.error("Error importing shop:", error)
    return {
      success: false,
      message: "Failed to import shop. Please try again.",
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Server action to batch import shops from multiple locations
 */
export async function batchImportShops(
  locations: { name: string; lat: number; lng: number }[],
  radius = 25000,
  onProgress?: (status: any) => void,
) {
  try {
    const supabase = createClient()
    const results = []

    // First pass to get total count
    const batchResults = await batchSearchIceCreamBusinesses(locations, radius)
    const totalShops = batchResults.reduce((sum, location) => sum + location.results.length, 0)

    let totalProcessed = 0
    let totalImported = 0
    let totalSkipped = 0
    let totalFailed = 0

    // Process each location
    for (const locationResult of batchResults) {
      // Process each shop in the location
      for (const place of locationResult.results) {
        try {
          // Get detailed information
          const details = await getPlaceDetails(place.place_id)
          const shopData = await convertPlaceToShop(details)

          // Check if shop already exists
          const { data: existingShops } = await supabase
            .from("shops")
            .select("id")
            .eq("googlePlaceId", place.place_id)
            .limit(1)

          if (existingShops && existingShops.length > 0) {
            totalSkipped++
            totalProcessed++
            continue
          }

          // Insert the shop
          const { error } = await supabase.from("shops").insert([shopData])

          if (error) {
            throw error
          }

          totalImported++
          results.push(shopData)

          // Add a small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 500))
        } catch (error) {
          console.error("Error importing shop:", error)
          totalFailed++
        }

        totalProcessed++
      }
    }

    return {
      success: true,
      total: totalShops,
      processed: totalProcessed,
      imported: totalImported,
      skipped: totalSkipped,
      failed: totalFailed,
      results,
    }
  } catch (error) {
    console.error("Error in batch import:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

/**
 * Server action to check if a shop already exists
 */
export async function checkShopExists(name: string, address: string) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.from("shops").select("id").eq("name", name).eq("address", address).limit(1)

    if (error) throw error

    return {
      success: true,
      exists: data && data.length > 0,
    }
  } catch (error) {
    console.error("Error checking if shop exists:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      exists: false,
    }
  }
}
