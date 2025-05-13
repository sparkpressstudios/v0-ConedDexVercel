"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { analyzeFlavor } from "@/lib/services/ai-service"
import { redirect } from "next/navigation"

// Adding the missing export that was flagged in the deployment error
export async function analyzeNewFlavor(flavorId: string) {
  // This is an alias for processFlavorSubmission to maintain backward compatibility
  return processFlavorSubmission(flavorId)
}

// Process a new flavor submission with AI and auto-approve if safe
export async function processFlavorSubmission(flavorId: string) {
  const supabase = createClient()

  // Get the flavor data
  const { data: flavor, error: flavorError } = await supabase.from("flavors").select("*").eq("id", flavorId).single()

  if (flavorError || !flavor) {
    throw new Error("Flavor not found")
  }

  // Get some existing flavors for comparison
  const { data: existingFlavors } = await supabase
    .from("flavors")
    .select("name, description")
    .eq("status", "approved")
    .limit(20)

  // Perform comprehensive analysis
  const analysisResults = await analyzeFlavor(
    flavor.name,
    flavor.description || "",
    flavor.image_url,
    existingFlavors || [],
  )

  // Determine if content should be auto-approved or sent for review
  let newStatus = "pending"
  let moderationNotes = ""

  // Auto-approve if:
  // 1. Content is appropriate
  // 2. Image is appropriate (or no image)
  // 3. Not a high-confidence duplicate
  const isContentSafe = analysisResults.contentSeverity === "none" || analysisResults.contentSeverity === "low"

  const isImageSafe =
    !flavor.image_url || analysisResults.imageSeverity === "none" || analysisResults.imageSeverity === "low"

  const isNotDuplicate = !analysisResults.isDuplicate || analysisResults.duplicateConfidence < 0.8

  if (isContentSafe && isImageSafe && isNotDuplicate) {
    newStatus = "approved"
    moderationNotes = "Auto-approved by AI moderation system"
  } else {
    // Set for manual review with reason
    newStatus = "pending"

    if (!isContentSafe) {
      moderationNotes +=
        "Flagged for content issues: " + (analysisResults.contentIssues?.join(", ") || "Unknown issues") + "\n"
    }

    if (!isImageSafe) {
      moderationNotes +=
        "Flagged for image issues: " + (analysisResults.imageIssues?.join(", ") || "Unknown issues") + "\n"
    }

    if (!isNotDuplicate) {
      moderationNotes += `Potential duplicate of "${analysisResults.similarTo}" (${Math.round(analysisResults.duplicateConfidence * 100)}% confidence)\n`
    }
  }

  // Store the analysis results and update status
  const { error: updateError } = await supabase
    .from("flavors")
    .update({
      // AI analysis results
      ai_categories: analysisResults.tags || [],
      ai_rarity: analysisResults.rarity,
      ai_duplicate_score: analysisResults.duplicateConfidence,
      ai_moderation_flags: analysisResults.contentIssues || [],
      ai_analyzed_at: new Date().toISOString(),
      ai_similar_flavors: analysisResults.similarTo ? [analysisResults.similarTo] : [],

      // Moderation status
      status: newStatus,
      moderation_notes: moderationNotes,
      moderated_at: newStatus === "approved" ? new Date().toISOString() : null,
    })
    .eq("id", flavorId)

  if (updateError) {
    console.error("Failed to update flavor with AI analysis:", updateError)
    throw new Error("Failed to update flavor with AI analysis")
  }

  revalidatePath(`/dashboard/admin/moderation`)
  revalidatePath(`/dashboard/shop/flavors/${flavorId}`)

  return {
    ...analysisResults,
    autoApproved: newStatus === "approved",
  }
}

// Analyze a flavor with AI and store the results (for admin-triggered analysis)
export async function analyzeFlavorWithAI(flavorId: string) {
  const supabase = createClient()

  // Get the flavor data
  const { data: flavor, error: flavorError } = await supabase.from("flavors").select("*").eq("id", flavorId).single()

  if (flavorError || !flavor) {
    throw new Error("Flavor not found")
  }

  // Get some existing flavors for comparison
  const { data: existingFlavors } = await supabase
    .from("flavors")
    .select("name, description")
    .eq("status", "approved")
    .limit(20)

  // Perform comprehensive analysis
  const analysisResults = await analyzeFlavor(
    flavor.name,
    flavor.description || "",
    flavor.image_url,
    existingFlavors || [],
  )

  // Store the analysis results
  const { error: updateError } = await supabase
    .from("flavors")
    .update({
      ai_categories: analysisResults.tags || [],
      ai_rarity: analysisResults.rarity,
      ai_duplicate_score: analysisResults.duplicateConfidence,
      ai_moderation_flags: analysisResults.contentIssues || [],
      ai_analyzed_at: new Date().toISOString(),
      ai_similar_flavors: analysisResults.similarTo ? [analysisResults.similarTo] : [],
    })
    .eq("id", flavorId)

  if (updateError) {
    throw new Error("Failed to update flavor with AI analysis")
  }

  revalidatePath(`/dashboard/admin/moderation`)
  revalidatePath(`/dashboard/shop/flavors/${flavorId}`)

  return analysisResults
}

// Approve a flavor after moderation
export async function approveFlavor(flavorId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("flavors")
    .update({
      status: "approved",
      moderated_at: new Date().toISOString(),
    })
    .eq("id", flavorId)

  if (error) {
    throw new Error("Failed to approve flavor")
  }

  revalidatePath(`/dashboard/admin/moderation`)
  return { success: true }
}

// Reject a flavor after moderation
export async function rejectFlavor(flavorId: string, reason: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("flavors")
    .update({
      status: "rejected",
      moderation_notes: reason,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", flavorId)

  if (error) {
    throw new Error("Failed to reject flavor")
  }

  revalidatePath(`/dashboard/admin/moderation`)
  return { success: true }
}

// Request additional information about a flavor
export async function requestMoreInfo(flavorId: string, message: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from("flavors")
    .update({
      status: "info_requested",
      moderation_notes: message,
      moderated_at: new Date().toISOString(),
    })
    .eq("id", flavorId)

  if (error) {
    throw new Error("Failed to request more information")
  }

  // Here you would typically also send a notification to the user

  revalidatePath(`/dashboard/admin/moderation`)
  return { success: true }
}

// Update the moderation queue page
export async function updateModerationQueue() {
  revalidatePath(`/dashboard/admin/moderation`)
  redirect("/dashboard/admin/moderation")
}
