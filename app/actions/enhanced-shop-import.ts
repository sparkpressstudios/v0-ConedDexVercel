"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import {
  getPlaceDetails,
  convertPlaceToShop,
  validateShopData,
  findNearbyIceCreamShops,
  searchIceCreamShops,
  geocodeAddress,
  type PlaceSearchResult,
  type FilterOptions,
  type PlaceDetails,
} from "@/lib/services/enhanced-places-service"

// Types for import operations
export interface ImportOptions {
  validateBeforeImport?: boolean
  skipExisting?: boolean
  updateExisting?: boolean
  importPhotos?: boolean
  importReviews?: boolean
  notifyOnCompletion?: boolean
  maxResults?: number
  adminUserId?: string
}

export interface ImportResult {
  success: boolean
  message: string
  imported: number
  skipped: number
  failed: number
  errors: string[]
  shopIds?: string[]
}

export interface SearchParams {
  query?: string
  location?: {
    address?: string
    lat?: number
    lng?: number
  }
  radius?: number
  filterOptions?: FilterOptions
}

/**
 * Search for ice cream shops with robust filtering
 */
export async function searchForShops(params: SearchParams): Promise<{
  results: PlaceSearchResult[]
  nextPageToken?: string
}> {
  try {
    let results: PlaceSearchResult[] = []
    let nextPageToken: string | undefined

    // Search by location
    if (params.location) {
      let lat: number
      let lng: number

      // If we have an address but no coordinates, geocode it
      if (params.location.address && (!params.location.lat || !params.location.lng)) {
        const geocoded = await geocodeAddress(params.location.address)
        if (!geocoded) {
          throw new Error(`Could not geocode address: ${params.location.address}`)
        }
        lat = geocoded.lat
        lng = geocoded.lng
      } else if (params.location.lat && params.location.lng) {
        lat = params.location.lat
        lng = params.location.lng
      } else {
        throw new Error("Invalid location parameters")
      }

      // Find nearby ice cream shops
      results = await findNearbyIceCreamShops(lat, lng, params.radius || 5000, params.filterOptions)
    }
    // Search by query
    else if (params.query) {
      results = await searchIceCreamShops(params.query, params.filterOptions)
    } else {
      throw new Error("Either query or location must be provided")
    }

    return { results, nextPageToken }
  } catch (error) {
    console.error("Error searching for shops:", error)
    throw new Error(`Failed to search for shops: ${error.message}`)
  }
}

/**
 * Import reviews for a shop
 */
async function importShopReviews(shopId: string, placeDetails: PlaceDetails, supabase: any): Promise<number> {
  if (!placeDetails.reviews || placeDetails.reviews.length === 0) {
    return 0
  }

  try {
    // Format reviews for insertion
    const reviewsToInsert = placeDetails.reviews.map((review) => ({
      shop_id: shopId,
      author_name: review.author_name,
      rating: review.rating,
      text: review.text,
      time: review.time ? new Date(review.time * 1000) : new Date(),
      source: "google_places",
      created_at: new Date(),
    }))

    // Insert reviews
    const { data, error } = await supabase.from("imported_reviews").insert(reviewsToInsert)

    if (error) {
      console.error("Error importing reviews:", error)
      return 0
    }

    return reviewsToInsert.length
  } catch (error) {
    console.error("Error importing reviews:", error)
    return 0
  }
}

/**
 * Import a single shop from Google Places
 */
export async function importShop(placeId: string, options: ImportOptions = {}): Promise<ImportResult> {
  try {
    const supabase = createServerActionClient({ cookies })

    // Check if shop already exists
    if (options.skipExisting || options.updateExisting) {
      const { data: existingShop } = await supabase
        .from("shops")
        .select("id, googlePlaceId, lastUpdated")
        .eq("googlePlaceId", placeId)
        .single()

      if (existingShop) {
        // Skip if requested
        if (options.skipExisting) {
          return {
            success: true,
            message: "Shop already exists and was skipped",
            imported: 0,
            skipped: 1,
            failed: 0,
            errors: [],
            shopIds: [existingShop.id],
          }
        }

        // Update if requested
        if (options.updateExisting) {
          // Get updated details
          const placeDetails = await getPlaceDetails(placeId)
          const shopData = await convertPlaceToShop(placeDetails)

          // Validate if requested
          if (options.validateBeforeImport) {
            const validation = await validateShopData({
              ...shopData,
              id: existingShop.id, // Add ID to prevent duplicate check
            })

            if (!validation.valid) {
              return {
                success: false,
                message: "Shop data validation failed",
                imported: 0,
                skipped: 0,
                failed: 1,
                errors: validation.errors,
              }
            }
          }

          // Update the shop
          const { error } = await supabase
            .from("shops")
            .update({
              ...shopData,
              lastUpdated: new Date().toISOString(),
              imported_by: options.adminUserId,
              last_synced: new Date().toISOString(),
            })
            .eq("id", existingShop.id)

          if (error) {
            return {
              success: false,
              message: `Error updating shop: ${error.message}`,
              imported: 0,
              skipped: 0,
              failed: 1,
              errors: [error.message],
            }
          }

          // Import reviews if requested
          if (options.importReviews) {
            await importShopReviews(existingShop.id, placeDetails, supabase)
          }

          // Revalidate the shops page
          revalidatePath("/dashboard/shops")
          revalidatePath("/dashboard/admin/shops")

          return {
            success: true,
            message: "Shop updated successfully",
            imported: 1,
            skipped: 0,
            failed: 0,
            errors: [],
            shopIds: [existingShop.id],
          }
        }
      }
    }

    // Get place details
    const placeDetails = await getPlaceDetails(placeId)

    // Convert to our shop format
    const shopData = await convertPlaceToShop(placeDetails)

    // Validate if requested
    if (options.validateBeforeImport) {
      const validation = await validateShopData(shopData)

      if (!validation.valid) {
        return {
          success: false,
          message: "Shop data validation failed",
          imported: 0,
          skipped: 0,
          failed: 1,
          errors: validation.errors,
        }
      }
    }

    // Add admin user ID if provided
    if (options.adminUserId) {
      shopData.imported_by = options.adminUserId
    }

    // Insert the shop
    const { data: shop, error } = await supabase.from("shops").insert(shopData).select("id").single()

    if (error) {
      return {
        success: false,
        message: `Error importing shop: ${error.message}`,
        imported: 0,
        skipped: 0,
        failed: 1,
        errors: [error.message],
      }
    }

    // Import reviews if requested
    if (options.importReviews && shop) {
      await importShopReviews(shop.id, placeDetails, supabase)
    }

    // Revalidate the shops page
    revalidatePath("/dashboard/shops")
    revalidatePath("/dashboard/admin/shops")

    return {
      success: true,
      message: "Shop imported successfully",
      imported: 1,
      skipped: 0,
      failed: 0,
      errors: [],
      shopIds: [shop.id],
    }
  } catch (error) {
    console.error("Error importing shop:", error)
    return {
      success: false,
      message: `Failed to import shop: ${error.message}`,
      imported: 0,
      skipped: 0,
      failed: 1,
      errors: [error.message],
    }
  }
}

/**
 * Batch import multiple shops from Google Places
 */
export async function batchImportShops(placeIds: string[], options: ImportOptions = {}): Promise<ImportResult> {
  const results: ImportResult = {
    success: true,
    message: "",
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    shopIds: [],
  }

  // Limit the number of results if specified
  const limitedPlaceIds = options.maxResults ? placeIds.slice(0, options.maxResults) : placeIds

  // Process each place ID
  for (const placeId of limitedPlaceIds) {
    try {
      const result = await importShop(placeId, options)

      // Update counts
      results.imported += result.imported
      results.skipped += result.skipped
      results.failed += result.failed

      // Collect errors
      if (result.errors.length > 0) {
        results.errors.push(`Errors for ${placeId}: ${result.errors.join(", ")}`)
      }

      // Collect shop IDs
      if (result.shopIds && result.shopIds.length > 0) {
        results.shopIds = [...(results.shopIds || []), ...result.shopIds]
      }

      // Add a small delay to avoid overwhelming the database
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      results.failed++
      results.errors.push(`Failed to import ${placeId}: ${error.message}`)
    }
  }

  // Set the final message
  results.message = `Processed ${limitedPlaceIds.length} shops: ${results.imported} imported, ${results.skipped} skipped, ${results.failed} failed`
  results.success = results.failed === 0

  return results
}

/**
 * Import shops from search results
 */
export async function importShopsFromSearch(
  searchParams: SearchParams,
  options: ImportOptions = {},
): Promise<ImportResult> {
  try {
    // Search for shops
    const { results } = await searchForShops(searchParams)

    if (results.length === 0) {
      return {
        success: false,
        message: "No shops found matching the search criteria",
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      }
    }

    // Extract place IDs
    const placeIds = results.map((result) => result.place_id)

    // Import the shops
    return await batchImportShops(placeIds, options)
  } catch (error) {
    console.error("Error importing shops from search:", error)
    return {
      success: false,
      message: `Failed to import shops from search: ${error.message}`,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [error.message],
    }
  }
}

/**
 * Import shops from a specific area
 */
export async function importShopsInArea(
  address: string,
  radius = 5000,
  options: ImportOptions = {},
): Promise<ImportResult> {
  try {
    // Geocode the address
    const location = await geocodeAddress(address)

    if (!location) {
      return {
        success: false,
        message: `Could not geocode address: ${address}`,
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: [`Could not geocode address: ${address}`],
      }
    }

    // Search for shops in the area
    return await importShopsFromSearch(
      {
        location: {
          lat: location.lat,
          lng: location.lng,
        },
        radius,
        filterOptions: {
          minRating: 3.5,
          onlyOpenBusinesses: true,
        },
      },
      options,
    )
  } catch (error) {
    console.error("Error importing shops in area:", error)
    return {
      success: false,
      message: `Failed to import shops in area: ${error.message}`,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [error.message],
    }
  }
}

/**
 * Import top-rated ice cream shops in multiple cities
 */
export async function importTopShopsInCities(
  cities: string[],
  options: ImportOptions = {
    validateBeforeImport: true,
    skipExisting: true,
    maxResults: 5, // Limit to top 5 per city
  },
): Promise<ImportResult> {
  const results: ImportResult = {
    success: true,
    message: "",
    imported: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    shopIds: [],
  }

  for (const city of cities) {
    try {
      // Import shops for this city
      const cityResult = await importShopsInArea(
        city,
        10000, // 10km radius
        {
          ...options,
          maxResults: options.maxResults || 5,
        },
      )

      // Update counts
      results.imported += cityResult.imported
      results.skipped += cityResult.skipped
      results.failed += cityResult.failed

      // Collect errors
      if (cityResult.errors.length > 0) {
        results.errors.push(`Errors for ${city}: ${cityResult.errors.join(", ")}`)
      }

      // Collect shop IDs
      if (cityResult.shopIds && cityResult.shopIds.length > 0) {
        results.shopIds = [...(results.shopIds || []), ...cityResult.shopIds]
      }

      // Add a delay between cities to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 1000))
    } catch (error) {
      results.failed++
      results.errors.push(`Failed to import shops in ${city}: ${error.message}`)
    }
  }

  // Set the final message
  results.message = `Processed ${cities.length} cities: ${results.imported} shops imported, ${results.skipped} skipped, ${results.failed} failed`

  return results
}

/**
 * Update all existing shops with latest data from Google Places
 */
export async function refreshAllShops(
  options: ImportOptions = {
    validateBeforeImport: true,
    updateExisting: true,
  },
): Promise<ImportResult> {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get all shops with Google Place IDs
    const { data: shops, error } = await supabase
      .from("shops")
      .select("id, googlePlaceId")
      .not("googlePlaceId", "is", null)

    if (error) {
      return {
        success: false,
        message: `Error fetching shops: ${error.message}`,
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: [error.message],
      }
    }

    if (!shops || shops.length === 0) {
      return {
        success: true,
        message: "No shops found to refresh",
        imported: 0,
        skipped: 0,
        failed: 0,
        errors: [],
      }
    }

    // Extract place IDs
    const placeIds = shops.map((shop) => shop.googlePlaceId).filter(Boolean)

    // Update the shops
    return await batchImportShops(placeIds, {
      ...options,
      updateExisting: true,
    })
  } catch (error) {
    console.error("Error refreshing all shops:", error)
    return {
      success: false,
      message: `Failed to refresh shops: ${error.message}`,
      imported: 0,
      skipped: 0,
      failed: 0,
      errors: [error.message],
    }
  }
}
