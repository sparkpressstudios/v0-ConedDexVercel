"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function generateFlavorCatalog(shopId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get shop data
    const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", shopId).single()

    if (shopError) {
      throw new Error(`Error fetching shop: ${shopError.message}`)
    }

    // Get shop flavors with full details
    const { data: flavors, error: flavorsError } = await supabase
      .from("shop_flavors")
      .select(`
        *,
        flavors(*)
      `)
      .eq("shop_id", shopId)

    if (flavorsError) {
      throw new Error(`Error fetching flavors: ${flavorsError.message}`)
    }

    // Generate catalog data
    const catalogData = {
      shop,
      flavors: flavors.map((item) => ({
        ...item.flavors,
        availability: item.availability,
        price: item.price,
        special: item.special,
      })),
      generatedAt: new Date().toISOString(),
    }

    // Instead of writing to file, return the data
    return {
      success: true,
      data: catalogData,
    }
  } catch (error) {
    console.error("Error generating flavor catalog:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
