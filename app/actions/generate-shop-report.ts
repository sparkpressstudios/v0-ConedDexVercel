"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function generateShopReport(shopId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get shop data
    const { data: shop, error: shopError } = await supabase.from("shops").select("*").eq("id", shopId).single()

    if (shopError) {
      throw new Error(`Error fetching shop: ${shopError.message}`)
    }

    // Get shop flavors
    const { data: flavors, error: flavorsError } = await supabase
      .from("shop_flavors")
      .select("*, flavors(*)")
      .eq("shop_id", shopId)

    if (flavorsError) {
      throw new Error(`Error fetching flavors: ${flavorsError.message}`)
    }

    // Get shop reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from("shop_reviews")
      .select("*, profiles(full_name)")
      .eq("shop_id", shopId)

    if (reviewsError) {
      throw new Error(`Error fetching reviews: ${reviewsError.message}`)
    }

    // Generate report data
    const reportData = {
      shop,
      flavors,
      reviews,
      generatedAt: new Date().toISOString(),
      summary: {
        totalFlavors: flavors.length,
        totalReviews: reviews.length,
        averageRating:
          reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0,
      },
    }

    // Instead of writing to file, return the data
    return {
      success: true,
      data: reportData,
    }
  } catch (error) {
    console.error("Error generating shop report:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}
