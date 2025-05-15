"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export async function checkInToShop(shopId: string, flavorIds: string[] = []) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "You must be logged in to check in" }
    }

    // Create check-in record
    const { data: checkIn, error: checkInError } = await supabase
      .from("shop_checkins")
      .insert({
        shop_id: shopId,
        user_id: user.id,
        flavors: flavorIds.length > 0 ? flavorIds : null,
      })
      .select()
      .single()

    if (checkInError) {
      console.error("Error creating check-in:", checkInError)
      return { success: false, error: "Failed to check in to shop" }
    }

    // Update user stats
    const { error: statsError } = await supabase.rpc("increment_user_checkin_count", {
      user_id_param: user.id,
    })

    if (statsError) {
      console.error("Error updating user stats:", statsError)
    }

    // Revalidate relevant paths
    revalidatePath(`/business/${shopId}`)
    revalidatePath(`/dashboard/shops/${shopId}`)
    revalidatePath("/shops")
    revalidatePath("/dashboard/my-conedex")

    return {
      success: true,
      data: checkIn,
      message: "Successfully checked in to shop",
    }
  } catch (error) {
    console.error("Error in checkInToShop:", error)
    return {
      success: false,
      error: "An unexpected error occurred",
    }
  }
}

// Re-export the function

// Additional check-in related actions can be added here
export async function getRecentCheckins(limit = 5) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("shop_checkins")
      .select(`
        *,
        shop:shops(id, name, city, state),
        user:profiles(id, username, full_name, avatar_url)
      `)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching recent check-ins:", error)
      return { success: false, error: "Failed to fetch recent check-ins" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getRecentCheckIns:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

export async function getUserCheckins(userId: string, limit = 10) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  try {
    const { data, error } = await supabase
      .from("shop_checkins")
      .select(`
        *,
        shop:shops(id, name, city, state, mainImage)
      `)
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      console.error("Error fetching user check-ins:", error)
      return { success: false, error: "Failed to fetch check-ins" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error in getUserCheckIns:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
