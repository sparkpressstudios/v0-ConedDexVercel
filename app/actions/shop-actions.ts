"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

// Other existing functions...

export async function checkInToShop(formData: FormData) {
  const shopId = formData.get("shopId") as string
  const flavorId = (formData.get("flavorId") as string) || null
  const rating = formData.get("rating") ? Number.parseInt(formData.get("rating") as string) : null
  const notes = (formData.get("notes") as string) || null

  if (!shopId) {
    return { success: false, error: "Shop ID is required" }
  }

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
        flavor_id: flavorId,
        rating,
        notes,
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

    // If a flavor was logged, update flavor popularity
    if (flavorId) {
      const { error: flavorError } = await supabase.rpc("increment_flavor_popularity", {
        p_flavor_id: flavorId,
      })

      if (flavorError) {
        console.error("Error updating flavor popularity:", flavorError)
      }
    }

    revalidatePath(`/business/${shopId}`)
    revalidatePath("/shops")
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

// Other existing functions...
