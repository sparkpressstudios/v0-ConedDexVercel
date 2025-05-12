"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { searchPlaces, getPlaceDetails } from "../api/maps/actions"

// Function to search for businesses
export async function searchBusinesses(query: string, location?: string, radius?: number) {
  try {
    const result = await searchPlaces(query, location, radius)
    return result
  } catch (error) {
    console.error("Error searching businesses:", error)
    throw new Error("Failed to search businesses")
  }
}

// Function to get business details
export async function getBusinessDetails(placeId: string) {
  try {
    const result = await getPlaceDetails(placeId)
    return result
  } catch (error) {
    console.error("Error getting business details:", error)
    throw new Error("Failed to get business details")
  }
}

// Add the missing importShopToDatabase function
export async function importShopToDatabase(placeDetails: any) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Check if shop already exists
    const { data: existingShop } = await supabase
      .from("shops")
      .select("id")
      .eq("place_id", placeDetails.place_id)
      .single()

    if (existingShop) {
      return {
        success: false,
        message: "Shop already exists in the database",
        shopId: existingShop.id,
      }
    }

    // Format the shop data
    const shopData = {
      name: placeDetails.name,
      address: placeDetails.formatted_address,
      phone: placeDetails.formatted_phone_number,
      website: placeDetails.website,
      place_id: placeDetails.place_id,
      latitude: placeDetails.geometry?.location?.lat,
      longitude: placeDetails.geometry?.location?.lng,
      rating: placeDetails.rating,
      photo_reference: placeDetails.photos?.[0]?.photo_reference,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Insert the shop
    const { data: shop, error } = await supabase.from("shops").insert(shopData).select("id").single()

    if (error) {
      console.error("Error importing shop:", error)
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: "Shop imported successfully",
      shopId: shop.id,
    }
  } catch (error) {
    console.error("Error importing shop:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to import shop",
    }
  }
}

// Function to import a shop
export async function importShop(shopData: any) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Check if shop already exists
    const { data: existingShop } = await supabase.from("shops").select("id").eq("place_id", shopData.place_id).single()

    if (existingShop) {
      return { success: false, message: "Shop already exists", shopId: existingShop.id }
    }

    // Insert the shop
    const { data: shop, error } = await supabase
      .from("shops")
      .insert({
        name: shopData.name,
        address: shopData.formatted_address,
        phone: shopData.formatted_phone_number,
        website: shopData.website,
        place_id: shopData.place_id,
        latitude: shopData.geometry?.location?.lat,
        longitude: shopData.geometry?.location?.lng,
        rating: shopData.rating,
        photo_reference: shopData.photos?.[0]?.photo_reference,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .single()

    if (error) {
      console.error("Error importing shop:", error)
      return { success: false, message: error.message }
    }

    return { success: true, message: "Shop imported successfully", shopId: shop.id }
  } catch (error) {
    console.error("Error importing shop:", error)
    throw new Error("Failed to import shop")
  }
}

// Function to batch import shops
export async function batchImportShops(shops: any[]) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Prepare the shops data
    const shopsData = shops.map((shop) => ({
      name: shop.name,
      address: shop.formatted_address,
      phone: shop.formatted_phone_number,
      website: shop.website,
      place_id: shop.place_id,
      latitude: shop.geometry?.location?.lat,
      longitude: shop.geometry?.location?.lng,
      rating: shop.rating,
      photo_reference: shop.photos?.[0]?.photo_reference,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Insert the shops
    const { data, error } = await supabase.from("shops").insert(shopsData).select("id")

    if (error) {
      console.error("Error batch importing shops:", error)
      return { success: false, message: error.message }
    }

    return {
      success: true,
      message: `${data.length} shops imported successfully`,
      shopIds: data.map((shop) => shop.id),
    }
  } catch (error) {
    console.error("Error batch importing shops:", error)
    throw new Error("Failed to batch import shops")
  }
}
