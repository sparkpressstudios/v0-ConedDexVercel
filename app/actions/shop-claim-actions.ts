"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Submit a claim for a shop
export async function submitShopClaim(shopId: string, userId: string, verificationData: any) {
  try {
    const supabase = createServerClient()

    // Check if the shop exists
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id, name, claimed_by")
      .eq("id", shopId)
      .single()

    if (shopError) {
      return { success: false, error: "Shop not found" }
    }

    // Check if the shop is already claimed
    if (shop.claimed_by) {
      return { success: false, error: "This shop has already been claimed" }
    }

    // Check if the user has any pending claims
    const { data: existingClaims, error: claimsError } = await supabase
      .from("shop_claims")
      .select("id, status")
      .eq("shop_id", shopId)
      .eq("user_id", userId)

    if (claimsError) {
      return { success: false, error: "Error checking existing claims" }
    }

    // If there's a pending claim, don't allow a new one
    if (existingClaims && existingClaims.length > 0) {
      const pendingClaim = existingClaims.find((claim) => claim.status === "pending")
      if (pendingClaim) {
        return { success: false, error: "You already have a pending claim for this shop" }
      }
    }

    // Create a new claim
    const { data: claim, error: claimError } = await supabase
      .from("shop_claims")
      .insert({
        shop_id: shopId,
        user_id: userId,
        verification_data: verificationData,
        status: "pending",
        submitted_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (claimError) {
      return { success: false, error: "Failed to submit claim" }
    }

    // Create a notification for admins
    await supabase.from("admin_notifications").insert({
      type: "shop_claim",
      title: "New Shop Claim",
      message: `A new claim has been submitted for ${shop.name}`,
      data: { shop_id: shopId, claim_id: claim.id },
      created_at: new Date().toISOString(),
    })

    revalidatePath(`/dashboard/shop/claim`)
    return { success: true, data: claim }
  } catch (error) {
    console.error("Error submitting shop claim:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get claims for a specific shop
export async function getShopClaims(shopId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("shop_claims")
      .select(`
        id,
        status,
        submitted_at,
        reviewed_at,
        profiles:user_id (
          id,
          username,
          full_name,
          avatar_url
        )
      `)
      .eq("shop_id", shopId)
      .order("submitted_at", { ascending: false })

    if (error) {
      return { success: false, error: "Failed to fetch claims" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting shop claims:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Get claims submitted by a user
export async function getUserClaims(userId: string) {
  try {
    const supabase = createServerClient()

    const { data, error } = await supabase
      .from("shop_claims")
      .select(`
        id,
        status,
        submitted_at,
        reviewed_at,
        shops:shop_id (
          id,
          name,
          address,
          image_url
        )
      `)
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false })

    if (error) {
      return { success: false, error: "Failed to fetch claims" }
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error getting user claims:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Review a shop claim (admin only)
export async function reviewShopClaim(claimId: string, approved: boolean, adminId: string, notes?: string) {
  try {
    const supabase = createServerClient()

    // Get the claim details
    const { data: claim, error: claimError } = await supabase
      .from("shop_claims")
      .select("id, shop_id, user_id")
      .eq("id", claimId)
      .single()

    if (claimError) {
      return { success: false, error: "Claim not found" }
    }

    // Update the claim status
    const { error: updateError } = await supabase
      .from("shop_claims")
      .update({
        status: approved ? "approved" : "rejected",
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
        admin_notes: notes,
      })
      .eq("id", claimId)

    if (updateError) {
      return { success: false, error: "Failed to update claim" }
    }

    // If approved, update the shop's claimed_by field
    if (approved) {
      const { error: shopError } = await supabase
        .from("shops")
        .update({
          claimed_by: claim.user_id,
          claimed_at: new Date().toISOString(),
        })
        .eq("id", claim.shop_id)

      if (shopError) {
        return { success: false, error: "Failed to update shop ownership" }
      }

      // Update user role to shop_owner if not already
      const { data: userData, error: userError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", claim.user_id)
        .single()

      if (!userError && userData && userData.role !== "admin") {
        await supabase.from("profiles").update({ role: "shop_owner" }).eq("id", claim.user_id)
      }
    }

    // Create a notification for the user
    await supabase.from("notifications").insert({
      user_id: claim.user_id,
      type: "claim_reviewed",
      title: approved ? "Shop Claim Approved" : "Shop Claim Rejected",
      message: approved
        ? "Your shop claim has been approved! You can now manage your shop."
        : `Your shop claim has been rejected. ${notes || ""}`,
      data: { shop_id: claim.shop_id, claim_id: claimId },
      read: false,
      created_at: new Date().toISOString(),
    })

    revalidatePath(`/dashboard/admin/shops/claims`)
    revalidatePath(`/dashboard/shop/claim`)
    return { success: true }
  } catch (error) {
    console.error("Error reviewing shop claim:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}

// Create a new shop listing
export async function createShopListing(shopData: any, userId: string) {
  try {
    const supabase = createServerClient()

    // Insert the new shop
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .insert({
        name: shopData.name,
        address: shopData.address,
        city: shopData.city,
        state: shopData.state,
        postal_code: shopData.postalCode,
        country: shopData.country,
        phone: shopData.phone,
        website: shopData.website,
        description: shopData.description,
        latitude: shopData.latitude,
        longitude: shopData.longitude,
        created_by: userId,
        claimed_by: userId, // Auto-claim the shop for the creator
        claimed_at: new Date().toISOString(),
        status: "pending_review", // New shops need admin approval
      })
      .select()
      .single()

    if (shopError) {
      return { success: false, error: "Failed to create shop listing" }
    }

    // Update user role to shop_owner if not already
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single()

    if (!userError && userData && userData.role !== "admin") {
      await supabase.from("profiles").update({ role: "shop_owner" }).eq("id", userId)
    }

    // Create a notification for admins
    await supabase.from("admin_notifications").insert({
      type: "new_shop",
      title: "New Shop Created",
      message: `A new shop "${shopData.name}" has been created and needs review`,
      data: { shop_id: shop.id },
      created_at: new Date().toISOString(),
    })

    revalidatePath(`/dashboard/shop`)
    return { success: true, data: shop }
  } catch (error) {
    console.error("Error creating shop listing:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
