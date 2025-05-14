"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { analyzeFlavor } from "@/lib/services/ai-service"

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
  // 4. Image actually contains ice cream
  const isContentSafe = analysisResults.contentSeverity === "none" || analysisResults.contentSeverity === "low"
  const isImageSafe =
    !flavor.image_url || analysisResults.imageSeverity === "none" || analysisResults.imageSeverity === "low"
  const isNotDuplicate = !analysisResults.isDuplicate || analysisResults.duplicateConfidence < 0.8
  const isActuallyIceCream = !flavor.image_url || analysisResults.isIceCream

  if (isContentSafe && isImageSafe && isNotDuplicate && isActuallyIceCream) {
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

    if (!isActuallyIceCream && flavor.image_url) {
      moderationNotes += "Image may not contain ice cream\n"
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

// Alias for backward compatibility
export async function analyzeNewFlavor(flavorId: string) {
  return processFlavorSubmission(flavorId)
}

// Other existing functions...
export {
  approveFlavor,
  rejectFlavor,
  requestMoreInfo,
  updateModerationQueue,
  analyzeFlavorWithAI,
} from "./flavor-moderation"
