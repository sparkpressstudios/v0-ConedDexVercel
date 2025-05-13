"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { moderateContent, analyzeFlavorText, checkForDuplicates, analyzeImage } from "@/lib/services/ai-service"
import { logAdminAction } from "./admin/audit-log-actions"

export async function updateModerationQueue() {
  try {
    const supabase = await createClient()

    // Get pending flavors
    const { data: pendingFlavors, error: pendingError } = await supabase
      .from("flavors")
      .select("*")
      .eq("status", "pending")
      .is("moderated_at", null)
      .order("created_at", { ascending: false })
      .limit(10)

    if (pendingError) {
      console.error("Error fetching pending flavors:", pendingError)
      return { success: false, message: "Failed to fetch pending flavors" }
    }

    // Process each pending flavor
    for (const flavor of pendingFlavors || []) {
      // Combine name and description for moderation
      const contentToModerate = `${flavor.name} ${flavor.description || ""}`

      // Check for inappropriate content
      const moderationResult = await moderateContent(contentToModerate)

      // Analyze flavor text for categories, rarity, etc.
      const analysisResult = await analyzeFlavorText(flavor.name, flavor.description || "", flavor.ingredients)

      // Check for duplicates
      const duplicateCheck = await checkForDuplicates(flavor.name, flavor.description || "")

      // Determine if auto-approval is possible
      const shouldAutoApprove =
        !moderationResult.flagged && analysisResult.flags.length === 0 && duplicateCheck.duplicateScore < 0.8

      // Update the flavor with moderation results
      const { error: updateError } = await supabase
        .from("flavors")
        .update({
          status: shouldAutoApprove ? "approved" : "pending",
          moderated_at: shouldAutoApprove ? new Date().toISOString() : null,
          moderation_notes: shouldAutoApprove ? "Auto-approved by AI moderation system" : null,
          ai_moderation_flags: moderationResult.flagged ? moderationResult.categories : [],
          ai_categories: analysisResult.categories,
          ai_rarity: analysisResult.rarity,
          ai_similar_flavors: duplicateCheck.similarFlavors,
          ai_duplicate_score: duplicateCheck.duplicateScore,
        })
        .eq("id", flavor.id)

      if (updateError) {
        console.error(`Error updating flavor ${flavor.id}:`, updateError)
      }
    }

    revalidatePath("/dashboard/admin/moderation")
    return { success: true, message: "Moderation queue updated successfully" }
  } catch (error) {
    console.error("Error updating moderation queue:", error)
    return { success: false, message: "Failed to update moderation queue" }
  }
}

// Process a new flavor submission with AI and auto-approve if safe
export async function processFlavorSubmission(flavorId: string) {
  const supabase = await createClient()

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

  // Combine name and description for moderation
  const contentToModerate = `${flavor.name} ${flavor.description || ""}`

  // Perform comprehensive analysis
  const moderationResults = await moderateContent(contentToModerate)
  const analysisResults = await analyzeFlavorText(flavor.name, flavor.description || "", flavor.ingredients)
  const duplicateResults = await checkForDuplicates(flavor.name, flavor.description || "")

  // Analyze image if available
  let imageAnalysis = {
    imageSeverity: "none" as const,
    imageIssues: [] as string[],
  }

  if (flavor.image_url) {
    imageAnalysis = await analyzeImage(flavor.image_url)
  }

  // Determine if content should be auto-approved or sent for review
  let newStatus = "pending"
  let moderationNotes = ""

  // Auto-approve if:
  // 1. Content is appropriate
  // 2. Image is appropriate (or no image)
  // 3. Not a high-confidence duplicate
  const isContentSafe = !moderationResults.flagged && analysisResults.flags.length === 0
  const isImageSafe =
    !flavor.image_url || imageAnalysis.imageSeverity === "none" || imageAnalysis.imageSeverity === "low"
  const isNotDuplicate = !duplicateResults.isDuplicate || duplicateResults.duplicateScore < 0.8

  if (isContentSafe && isImageSafe && isNotDuplicate) {
    newStatus = "approved"
    moderationNotes = "Auto-approved by AI moderation system"
  } else {
    // Set for manual review with reason
    newStatus = "pending"

    if (!isContentSafe) {
      moderationNotes += `Flagged for content issues: ${moderationResults.categories.join(", ") || "Unknown issues"}\n`
    }

    if (!isImageSafe) {
      moderationNotes += `Flagged for image issues: ${imageAnalysis.imageIssues.join(", ") || "Unknown issues"}\n`
    }

    if (!isNotDuplicate) {
      const similarFlavorName = duplicateResults.similarFlavors[0] || "another flavor"
      moderationNotes += `Potential duplicate of "${similarFlavorName}" (${Math.round(duplicateResults.duplicateScore * 100)}% confidence)\n`
    }
  }

  // Store the analysis results and update status
  const { error: updateError } = await supabase
    .from("flavors")
    .update({
      // AI analysis results
      ai_categories: analysisResults.categories || [],
      ai_rarity: analysisResults.rarity,
      ai_duplicate_score: duplicateResults.duplicateScore,
      ai_moderation_flags: moderationResults.flagged ? moderationResults.categories : [],
      ai_analyzed_at: new Date().toISOString(),
      ai_similar_flavors: duplicateResults.similarFlavors,

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
    categories: analysisResults.categories,
    rarity: analysisResults.rarity,
    flags: analysisResults.flags,
    contentSeverity: moderationResults.flagged ? "high" : "none",
    contentIssues: moderationResults.categories,
    imageSeverity: imageAnalysis.imageSeverity,
    imageIssues: imageAnalysis.imageIssues,
    isDuplicate: duplicateResults.isDuplicate,
    similarTo: duplicateResults.similarFlavors[0],
    duplicateConfidence: duplicateResults.duplicateScore,
    autoApproved: newStatus === "approved",
  }
}

// Adding the missing export that was flagged in the deployment error
export async function analyzeNewFlavor(flavorId: string) {
  // This is an alias for processFlavorSubmission to maintain backward compatibility
  return processFlavorSubmission(flavorId)
}

// Analyze a flavor with AI and store the results (for admin-triggered analysis)
export async function analyzeFlavorWithAI(flavorId: string) {
  const supabase = await createClient()

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
  const moderationResults = await moderateContent(`${flavor.name} ${flavor.description || ""}`)
  const analysisResults = await analyzeFlavorText(flavor.name, flavor.description || "", flavor.ingredients)
  const duplicateResults = await checkForDuplicates(flavor.name, flavor.description || "")

  // Analyze image if available
  let imageAnalysis = {
    imageSeverity: "none" as const,
    imageIssues: [] as string[],
  }

  if (flavor.image_url) {
    imageAnalysis = await analyzeImage(flavor.image_url)
  }

  // Store the analysis results
  const { error: updateError } = await supabase
    .from("flavors")
    .update({
      ai_categories: analysisResults.categories || [],
      ai_rarity: analysisResults.rarity,
      ai_duplicate_score: duplicateResults.duplicateScore,
      ai_moderation_flags: moderationResults.flagged ? moderationResults.categories : [],
      ai_analyzed_at: new Date().toISOString(),
      ai_similar_flavors: duplicateResults.similarFlavors,
    })
    .eq("id", flavorId)

  if (updateError) {
    throw new Error("Failed to update flavor with AI analysis")
  }

  revalidatePath(`/dashboard/admin/moderation`)
  revalidatePath(`/dashboard/shop/flavors/${flavorId}`)

  return {
    categories: analysisResults.categories,
    rarity: analysisResults.rarity,
    flags: analysisResults.flags,
    contentSeverity: moderationResults.flagged ? "high" : "none",
    contentIssues: moderationResults.categories,
    imageSeverity: imageAnalysis.imageSeverity,
    imageIssues: imageAnalysis.imageIssues,
    isDuplicate: duplicateResults.isDuplicate,
    similarTo: duplicateResults.similarFlavors[0],
    duplicateConfidence: duplicateResults.duplicateScore,
  }
}

export async function approveFlavor(flavorId: string) {
  try {
    const supabase = await createClient()

    // Update the flavor status
    const { error } = await supabase
      .from("flavors")
      .update({
        status: "approved",
        moderated_at: new Date().toISOString(),
        moderation_notes: "Approved by admin moderator",
      })
      .eq("id", flavorId)

    if (error) {
      console.error("Error approving flavor:", error)
      return { success: false, message: "Failed to approve flavor" }
    }

    // Log the admin action
    await logAdminAction({
      action: "approve_flavor",
      resource_type: "flavor",
      resource_id: flavorId,
      details: { status: "approved" },
    })

    revalidatePath("/dashboard/admin/moderation")
    return { success: true, message: "Flavor approved successfully" }
  } catch (error) {
    console.error("Error approving flavor:", error)
    return { success: false, message: "Failed to approve flavor" }
  }
}

export async function rejectFlavor(flavorId: string, reason: string) {
  try {
    const supabase = await createClient()

    // Update the flavor status
    const { error } = await supabase
      .from("flavors")
      .update({
        status: "rejected",
        moderated_at: new Date().toISOString(),
        moderation_notes: reason || "Rejected by admin moderator",
      })
      .eq("id", flavorId)

    if (error) {
      console.error("Error rejecting flavor:", error)
      return { success: false, message: "Failed to reject flavor" }
    }

    // Log the admin action
    await logAdminAction({
      action: "reject_flavor",
      resource_type: "flavor",
      resource_id: flavorId,
      details: { status: "rejected", reason },
    })

    revalidatePath("/dashboard/admin/moderation")
    return { success: true, message: "Flavor rejected successfully" }
  } catch (error) {
    console.error("Error rejecting flavor:", error)
    return { success: false, message: "Failed to reject flavor" }
  }
}

export async function requestMoreInfo(flavorId: string, message: string) {
  try {
    const supabase = await createClient()

    // Update the flavor status
    const { error } = await supabase
      .from("flavors")
      .update({
        status: "info_requested",
        moderation_notes: message || "Please provide more information about this flavor",
      })
      .eq("id", flavorId)

    if (error) {
      console.error("Error requesting more info:", error)
      return { success: false, message: "Failed to request more information" }
    }

    // Log the admin action
    await logAdminAction({
      action: "request_flavor_info",
      resource_type: "flavor",
      resource_id: flavorId,
      details: { status: "info_requested", message },
    })

    revalidatePath("/dashboard/admin/moderation")
    return { success: true, message: "Information request sent successfully" }
  } catch (error) {
    console.error("Error requesting more info:", error)
    return { success: false, message: "Failed to request more information" }
  }
}
