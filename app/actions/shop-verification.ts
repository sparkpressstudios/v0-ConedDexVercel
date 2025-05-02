"use server"

import { createServerClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function getShopVerificationStatus(shopId: string) {
  try {
    const supabase = createServerClient()
    const session = await getSession()

    if (!session) {
      return { error: "Unauthorized" }
    }

    // Check if user is shop owner or admin
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("owner_id, is_verified")
      .eq("id", shopId)
      .single()

    if (shopError) {
      console.error("Error fetching shop:", shopError)
      return { error: "Failed to fetch shop details" }
    }

    const isOwner = shop.owner_id === session.user.id
    const isAdmin = session.user.role === "admin"

    if (!isOwner && !isAdmin) {
      return { error: "Unauthorized" }
    }

    // Get the latest verification request
    const { data: verificationRequest, error: verificationError } = await supabase
      .from("shop_verification_requests")
      .select("*")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (verificationError && verificationError.code !== "PGRST116") {
      // PGRST116 is "no rows returned" which just means no verification request exists
      console.error("Error fetching verification request:", verificationError)
      return { error: "Failed to fetch verification status" }
    }

    return {
      isVerified: shop.is_verified,
      verificationRequest: verificationRequest || null,
    }
  } catch (error) {
    console.error("Error in getShopVerificationStatus:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function submitVerificationRequest(
  shopId: string,
  formData: {
    businessName: string
    businessAddress: string
    contactEmail: string
    contactPhone: string
    documentType: string
    documentUrl: string
    additionalNotes?: string
  },
) {
  try {
    const supabase = createServerClient()
    const session = await getSession()

    if (!session) {
      return { error: "Unauthorized" }
    }

    // Check if user is shop owner
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("owner_id, is_verified")
      .eq("id", shopId)
      .single()

    if (shopError) {
      console.error("Error fetching shop:", shopError)
      return { error: "Failed to fetch shop details" }
    }

    if (shop.owner_id !== session.user.id) {
      return { error: "Only shop owners can submit verification requests" }
    }

    if (shop.is_verified) {
      return { error: "Shop is already verified" }
    }

    // Check if there's a pending verification request
    const { data: existingRequests, error: requestsError } = await supabase
      .from("shop_verification_requests")
      .select("id, status")
      .eq("shop_id", shopId)
      .eq("status", "pending")

    if (requestsError) {
      console.error("Error checking existing requests:", requestsError)
      return { error: "Failed to check existing verification requests" }
    }

    if (existingRequests && existingRequests.length > 0) {
      return { error: "A verification request is already pending for this shop" }
    }

    // Insert new verification request
    const { data: newRequest, error: insertError } = await supabase
      .from("shop_verification_requests")
      .insert({
        shop_id: shopId,
        business_name: formData.businessName,
        business_address: formData.businessAddress,
        contact_email: formData.contactEmail,
        contact_phone: formData.contactPhone,
        document_type: formData.documentType,
        document_url: formData.documentUrl,
        additional_notes: formData.additionalNotes || null,
        status: "pending",
        submitted_by: session.user.id,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error submitting verification request:", insertError)
      return { error: "Failed to submit verification request" }
    }

    return { success: true, request: newRequest }
  } catch (error) {
    console.error("Error in submitVerificationRequest:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function approveVerificationRequest(requestId: string) {
  try {
    const supabase = createServerClient()
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized. Only admins can approve verification requests" }
    }

    // Get the verification request
    const { data: request, error: requestError } = await supabase
      .from("shop_verification_requests")
      .select("shop_id, status")
      .eq("id", requestId)
      .single()

    if (requestError) {
      console.error("Error fetching verification request:", requestError)
      return { error: "Failed to fetch verification request" }
    }

    if (request.status !== "pending") {
      return { error: "This request has already been processed" }
    }

    // Start a transaction
    const { error: updateError } = await supabase.rpc("approve_shop_verification", {
      request_id: requestId,
      admin_id: session.user.id,
    })

    if (updateError) {
      console.error("Error approving verification request:", updateError)
      return { error: "Failed to approve verification request" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in approveVerificationRequest:", error)
    return { error: "An unexpected error occurred" }
  }
}

export async function rejectVerificationRequest(requestId: string, reason: string) {
  try {
    const supabase = createServerClient()
    const session = await getSession()

    if (!session || session.user.role !== "admin") {
      return { error: "Unauthorized. Only admins can reject verification requests" }
    }

    // Get the verification request
    const { data: request, error: requestError } = await supabase
      .from("shop_verification_requests")
      .select("status")
      .eq("id", requestId)
      .single()

    if (requestError) {
      console.error("Error fetching verification request:", requestError)
      return { error: "Failed to fetch verification request" }
    }

    if (request.status !== "pending") {
      return { error: "This request has already been processed" }
    }

    // Update the verification request
    const { error: updateError } = await supabase
      .from("shop_verification_requests")
      .update({
        status: "rejected",
        rejection_reason: reason,
        reviewed_by: session.user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", requestId)

    if (updateError) {
      console.error("Error rejecting verification request:", updateError)
      return { error: "Failed to reject verification request" }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in rejectVerificationRequest:", error)
    return { error: "An unexpected error occurred" }
  }
}
