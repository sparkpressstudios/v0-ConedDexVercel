"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Check in to a shop
export async function checkInToShop(shopId: string, selectedFlavors: string[] = []) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "You must be logged in to check in" }
    }

    const userId = session.user.id

    // Create the check-in record
    const { data: checkIn, error: checkInError } = await supabase
      .from("shop_checkins")
      .insert({
        user_id: userId,
        shop_id: shopId,
        flavor_ids: selectedFlavors.length > 0 ? selectedFlavors : null,
      })
      .select()
      .single()

    if (checkInError) {
      console.error("Error creating check-in:", checkInError)
      return { success: false, error: "Failed to check in to shop" }
    }

    // Update shop check-in count
    const { error: updateError } = await supabase.rpc("increment_shop_checkins", {
      p_shop_id: shopId,
    })

    if (updateError) {
      console.error("Error updating shop check-in count:", updateError)
      // We'll still consider this a success since the check-in was recorded
    }

    // If flavors were logged, update flavor popularity
    if (selectedFlavors.length > 0) {
      for (const flavorId of selectedFlavors) {
        const { error: flavorError } = await supabase.rpc("increment_flavor_popularity", {
          p_flavor_id: flavorId,
        })

        if (flavorError) {
          console.error("Error updating flavor popularity:", flavorError)
        }
      }
    }

    revalidatePath(`/dashboard/shops/${shopId}`)
    revalidatePath("/dashboard/shops")
    revalidatePath("/dashboard")

    return {
      success: true,
      message: "Successfully checked in to shop",
      checkIn,
    }
  } catch (error) {
    console.error("Error in checkInToShop:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get recent check-ins for a user
export async function getRecentCheckIns(limit = 5) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return { success: false, error: "You must be logged in to view check-ins" }
    }

    const userId = session.user.id

    const { data, error } = await supabase
      .from("shop_checkins")
      .select(`
        id,
        created_at,
        shops (
          id,
          name,
          city,
          state,
          thumbnailImage
        )
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent check-ins:", error)
      return { success: false, error: "Failed to fetch recent check-ins" }
    }

    return {
      success: true,
      checkIns: data,
    }
  } catch (error) {
    console.error("Error in getRecentCheckIns:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// For backward compatibility
export const getRecentCheckins = getRecentCheckIns
