"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { Quest, QuestObjective, QuestReward, UserQuest } from "@/types/quests"
import { updateLeaderboardOnQuestCompleted } from "@/lib/utils/leaderboard-utils"
import { createNotification } from "@/app/actions/notification-actions"

/**
 * Get all active quests
 */
export async function getActiveQuests() {
  const supabase = await createServerClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("quests")
    .select(`
      *,
      objectives:quest_objectives(*),
      rewards:quest_rewards(*)
    `)
    .eq("is_active", true)
    .lte("start_date", now)
    .or(`end_date.gt.${now},end_date.is.null`)
    .order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching active quests:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get featured quests
 */
export async function getFeaturedQuests(limit = 3) {
  const supabase = await createServerClient()
  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from("quests")
    .select(`
      *,
      objectives:quest_objectives(*),
      rewards:quest_rewards(*)
    `)
    .eq("is_active", true)
    .eq("is_featured", true)
    .lte("start_date", now)
    .or(`end_date.gt.${now},end_date.is.null`)
    .order("start_date", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching featured quests:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get quest by ID
 */
export async function getQuestById(questId: string) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("quests")
    .select(`
      *,
      objectives:quest_objectives(*),
      rewards:quest_rewards(*)
    `)
    .eq("id", questId)
    .single()

  if (error) {
    console.error(`Error fetching quest ${questId}:`, error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get user quests
 */
export async function getUserQuests(userId: string) {
  const supabase = await createServerClient()

  // If userId is "current", get the current user's ID
  if (userId === "current") {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { data: null, error: "User not authenticated" }
    }
    userId = user.id
  }

  const { data, error } = await supabase
    .from("user_quests")
    .select(`
      *,
      quest:quests(
        *,
        objectives:quest_objectives(*),
        rewards:quest_rewards(*)
      )
    `)
    .eq("user_id", userId)
    .order("joined_at", { ascending: false })

  if (error) {
    console.error("Error fetching user quests:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Join a quest
 */
export async function joinQuest(questId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  // Check if user already joined this quest
  const { data: existingQuest } = await supabase
    .from("user_quests")
    .select("id")
    .eq("user_id", user.id)
    .eq("quest_id", questId)
    .single()

  if (existingQuest) {
    return { data: null, error: "You have already joined this quest" }
  }

  // Check if quest exists and is active
  const { data: quest, error: questError } = await supabase
    .from("quests")
    .select("*")
    .eq("id", questId)
    .eq("is_active", true)
    .single()

  if (questError || !quest) {
    return { data: null, error: "Quest not found or not active" }
  }

  // Check if quest has reached max participants
  if (quest.max_participants) {
    const { count, error: countError } = await supabase
      .from("user_quests")
      .select("*", { count: "exact", head: true })
      .eq("quest_id", questId)

    if (countError) {
      return { data: null, error: "Error checking quest participants" }
    }

    if (count && count >= quest.max_participants) {
      return { data: null, error: "Quest has reached maximum participants" }
    }
  }

  // Get quest objectives to initialize progress
  const { data: objectives } = await supabase.from("quest_objectives").select("*").eq("quest_id", questId)

  // Initialize progress for each objective
  const progress: Record<string, any> = {}
  objectives?.forEach((objective) => {
    progress[objective.id] = {
      objective_id: objective.id,
      current_count: 0,
      is_completed: false,
      last_updated: new Date().toISOString(),
    }
  })

  // Join the quest
  const { data, error } = await supabase
    .from("user_quests")
    .insert({
      user_id: user.id,
      quest_id: questId,
      status: "in_progress",
      progress,
    })
    .select()
    .single()

  if (error) {
    console.error("Error joining quest:", error)
    return { data: null, error: error.message }
  }

  // Create a notification for the user
  await createNotification({
    user_id: user.id,
    title: "Quest Joined",
    message: `You've joined the quest: ${quest.title}`,
    type: "quest_joined",
    metadata: { quest_id: questId },
  })

  // Add to activity log
  await supabase.from("activity_log").insert({
    user_id: user.id,
    activity_type: "quest_joined",
    description: `Joined quest: ${quest.title}`,
    metadata: { quest_id: questId },
  })

  revalidatePath("/dashboard/quests")
  return { data, error: null }
}

/**
 * Update quest progress
 */
export async function updateQuestProgress(userQuestId: string, objectiveId: string, increment = 1) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  // Get the user quest
  const { data: userQuest, error: userQuestError } = await supabase
    .from("user_quests")
    .select("*")
    .eq("id", userQuestId)
    .eq("user_id", user.id)
    .single()

  if (userQuestError || !userQuest) {
    return { data: null, error: "User quest not found" }
  }

  if (userQuest.status === "completed") {
    return { data: null, error: "Quest already completed" }
  }

  // Get the objective
  const { data: objective, error: objectiveError } = await supabase
    .from("quest_objectives")
    .select("*")
    .eq("id", objectiveId)
    .eq("quest_id", userQuest.quest_id)
    .single()

  if (objectiveError || !objective) {
    return { data: null, error: "Quest objective not found" }
  }

  // Get the quest for notifications
  const { data: quest } = await supabase.from("quests").select("title").eq("id", userQuest.quest_id).single()

  // Update progress
  const progress = userQuest.progress || {}
  const objectiveProgress = progress[objectiveId] || {
    objective_id: objectiveId,
    current_count: 0,
    is_completed: false,
    last_updated: new Date().toISOString(),
  }

  // Check if the objective was already completed
  const wasCompleted = objectiveProgress.is_completed

  objectiveProgress.current_count += increment
  objectiveProgress.is_completed = objectiveProgress.current_count >= objective.target_count
  objectiveProgress.last_updated = new Date().toISOString()

  progress[objectiveId] = objectiveProgress

  // Check if all objectives are completed
  const { data: allObjectives } = await supabase
    .from("quest_objectives")
    .select("id")
    .eq("quest_id", userQuest.quest_id)

  const allCompleted = allObjectives?.every((obj) => {
    const objProgress = progress[obj.id]
    return objProgress && objProgress.is_completed
  })

  // Update user quest
  const updateData: Partial<UserQuest> = {
    progress,
  }

  if (allCompleted) {
    updateData.status = "completed"
    updateData.completed_at = new Date().toISOString()
  }

  const { data, error } = await supabase.from("user_quests").update(updateData).eq("id", userQuestId).select().single()

  if (error) {
    console.error("Error updating quest progress:", error)
    return { data: null, error: error.message }
  }

  // If an objective was newly completed, create a notification
  if (!wasCompleted && objectiveProgress.is_completed) {
    await createNotification({
      user_id: user.id,
      title: "Objective Completed",
      message: `You've completed an objective in quest: ${quest?.title || "Unknown"}`,
      type: "objective_completed",
      metadata: { quest_id: userQuest.quest_id, objective_id: objectiveId },
    })
  }

  // If quest was completed, process rewards and create notification
  if (allCompleted) {
    const rewards = await processQuestRewards(user.id, userQuest.quest_id)

    await createNotification({
      user_id: user.id,
      title: "Quest Completed!",
      message: `Congratulations! You've completed the quest: ${quest?.title || "Unknown"}`,
      type: "quest_completed",
      metadata: { quest_id: userQuest.quest_id, rewards },
    })
  }

  revalidatePath("/dashboard/quests")
  return { data, error: null }
}

/**
 * Process quest rewards when a quest is completed
 */
async function processQuestRewards(userId: string, questId: string) {
  const supabase = await createServerClient()

  // Get quest rewards
  const { data: rewards } = await supabase.from("quest_rewards").select("*").eq("quest_id", questId)

  if (!rewards || rewards.length === 0) {
    return []
  }

  const processedRewards = []

  // Process each reward
  for (const reward of rewards) {
    if (reward.reward_type === "badge" && reward.badge_id) {
      // Award badge
      await supabase.from("user_badges").insert({
        user_id: userId,
        badge_id: reward.badge_id,
        awarded_at: new Date().toISOString(),
      })

      // Get badge details for the notification
      const { data: badge } = await supabase
        .from("badges")
        .select("name, description")
        .eq("id", reward.badge_id)
        .single()

      processedRewards.push({
        type: "badge",
        name: badge?.name || "Badge",
        description: badge?.description || "A new badge",
        badge_id: reward.badge_id,
      })
    }

    if (reward.reward_type === "points" && reward.points) {
      // Award points
      await updateLeaderboardOnQuestCompleted(userId, reward.points)

      processedRewards.push({
        type: "points",
        amount: reward.points,
        description: `${reward.points} points added to your score`,
      })
    }

    // Other reward types can be processed here
  }

  // Add to activity log
  await supabase.from("activity_log").insert({
    user_id: userId,
    activity_type: "quest_completed",
    description: `Completed a quest and received rewards`,
    metadata: { quest_id: questId, rewards: processedRewards },
  })

  return processedRewards
}

/**
 * Abandon a quest
 */
export async function abandonQuest(userQuestId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  // Get the quest details for the notification
  const { data: userQuest } = await supabase
    .from("user_quests")
    .select("quest_id")
    .eq("id", userQuestId)
    .eq("user_id", user.id)
    .single()

  if (userQuest) {
    const { data: quest } = await supabase.from("quests").select("title").eq("id", userQuest.quest_id).single()

    const { data, error } = await supabase
      .from("user_quests")
      .update({ status: "abandoned" })
      .eq("id", userQuestId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) {
      console.error("Error abandoning quest:", error)
      return { data: null, error: error.message }
    }

    // Create a notification
    await createNotification({
      user_id: user.id,
      title: "Quest Abandoned",
      message: `You've abandoned the quest: ${quest?.title || "Unknown"}`,
      type: "quest_abandoned",
      metadata: { quest_id: userQuest.quest_id },
    })

    // Add to activity log
    await supabase.from("activity_log").insert({
      user_id: user.id,
      activity_type: "quest_abandoned",
      description: `Abandoned quest: ${quest?.title || "Unknown"}`,
      metadata: { quest_id: userQuest.quest_id },
    })

    revalidatePath("/dashboard/quests")
    return { data, error: null }
  }

  return { data: null, error: "Quest not found" }
}

/**
 * ADMIN: Create a new quest
 */
export async function createQuest(
  questData: Partial<Quest>,
  objectives: Partial<QuestObjective>[],
  rewards: Partial<QuestReward>[],
) {
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" }
  }

  // Start a transaction
  // Note: Supabase JS client doesn't support transactions directly, so we'll use sequential operations

  // 1. Create the quest
  const { data: quest, error: questError } = await supabase.from("quests").insert(questData).select().single()

  if (questError) {
    console.error("Error creating quest:", questError)
    return { data: null, error: questError.message }
  }

  // 2. Create objectives
  const objectivesWithQuestId = objectives.map((obj) => ({
    ...obj,
    quest_id: quest.id,
  }))

  const { data: createdObjectives, error: objectivesError } = await supabase
    .from("quest_objectives")
    .insert(objectivesWithQuestId)
    .select()

  if (objectivesError) {
    console.error("Error creating quest objectives:", objectivesError)
    // Try to clean up the quest
    await supabase.from("quests").delete().eq("id", quest.id)
    return { data: null, error: objectivesError.message }
  }

  // 3. Create rewards
  const rewardsWithQuestId = rewards.map((reward) => ({
    ...reward,
    quest_id: quest.id,
  }))

  const { data: createdRewards, error: rewardsError } = await supabase
    .from("quest_rewards")
    .insert(rewardsWithQuestId)
    .select()

  if (rewardsError) {
    console.error("Error creating quest rewards:", rewardsError)
    // Note: We won't clean up here as objectives are already created
  }

  // Add to admin audit log
  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "create",
    resource_type: "quest",
    resource_id: quest.id,
    details: {
      quest: questData,
      objectives: objectives,
      rewards: rewards,
    },
  })

  // Return the complete quest with objectives and rewards
  const result = {
    ...quest,
    objectives: createdObjectives || [],
    rewards: createdRewards || [],
  }

  revalidatePath("/dashboard/admin/quests")
  return { data: result, error: null }
}

/**
 * ADMIN: Update a quest
 */
export async function updateQuest(
  questId: string,
  questData: Partial<Quest>,
  objectives?: Partial<QuestObjective>[],
  rewards?: Partial<QuestReward>[],
) {
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" }
  }

  // Update the quest
  const { data: updatedQuest, error: questError } = await supabase
    .from("quests")
    .update(questData)
    .eq("id", questId)
    .select()
    .single()

  if (questError) {
    console.error("Error updating quest:", questError)
    return { data: null, error: questError.message }
  }

  // Update objectives if provided
  if (objectives) {
    // Delete existing objectives
    await supabase.from("quest_objectives").delete().eq("quest_id", questId)

    // Create new objectives
    const objectivesWithQuestId = objectives.map((obj) => ({
      ...obj,
      quest_id: questId,
    }))

    const { error: objectivesError } = await supabase.from("quest_objectives").insert(objectivesWithQuestId)

    if (objectivesError) {
      console.error("Error updating quest objectives:", objectivesError)
      return { data: updatedQuest, error: objectivesError.message }
    }
  }

  // Update rewards if provided
  if (rewards) {
    // Delete existing rewards
    await supabase.from("quest_rewards").delete().eq("quest_id", questId)

    // Create new rewards
    const rewardsWithQuestId = rewards.map((reward) => ({
      ...reward,
      quest_id: questId,
    }))

    const { error: rewardsError } = await supabase.from("quest_rewards").insert(rewardsWithQuestId)

    if (rewardsError) {
      console.error("Error updating quest rewards:", rewardsError)
      return { data: updatedQuest, error: rewardsError.message }
    }
  }

  // Add to admin audit log
  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "update",
    resource_type: "quest",
    resource_id: questId,
    details: {
      quest: questData,
      objectives: objectives,
      rewards: rewards,
    },
  })

  revalidatePath("/dashboard/admin/quests")
  revalidatePath("/dashboard/quests")
  return { data: updatedQuest, error: null }
}

/**
 * ADMIN: Delete a quest
 */
export async function deleteQuest(questId: string) {
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" }
  }

  // Get quest details for audit log
  const { data: quest } = await supabase.from("quests").select("title").eq("id", questId).single()

  // Delete the quest (cascade will handle objectives, rewards, and user_quests)
  const { data, error } = await supabase.from("quests").delete().eq("id", questId)

  if (error) {
    console.error("Error deleting quest:", error)
    return { data: null, error: error.message }
  }

  // Add to admin audit log
  await supabase.from("admin_audit_log").insert({
    admin_id: user.id,
    action: "delete",
    resource_type: "quest",
    resource_id: questId,
    details: {
      quest_title: quest?.title || "Unknown quest",
    },
  })

  revalidatePath("/dashboard/admin/quests")
  return { data: true, error: null }
}

/**
 * ADMIN: Get all quests
 */
export async function getAllQuests() {
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" }
  }

  const { data, error } = await supabase
    .from("quests")
    .select(`
      *,
      objectives:quest_objectives(*),
      rewards:quest_rewards(*)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching all quests:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * ADMIN: Get quest statistics
 */
export async function getQuestStatistics(questId: string) {
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return { data: null, error: "Unauthorized: Admin access required" }
  }

  // Get participant count
  const { count: participantCount, error: countError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("quest_id", questId)

  if (countError) {
    console.error("Error getting participant count:", countError)
    return { data: null, error: countError.message }
  }

  // Get completion count
  const { count: completionCount, error: completionError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("quest_id", questId)
    .eq("status", "completed")

  if (completionError) {
    console.error("Error getting completion count:", completionError)
    return { data: null, error: completionError.message }
  }

  // Get abandonment count
  const { count: abandonmentCount, error: abandonmentError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("quest_id", questId)
    .eq("status", "abandoned")

  if (abandonmentError) {
    console.error("Error getting abandonment count:", abandonmentError)
    return { data: null, error: abandonmentError.message }
  }

  const completionRate = participantCount ? (completionCount / participantCount) * 100 : 0
  const abandonmentRate = participantCount ? (abandonmentCount / participantCount) * 100 : 0

  return {
    data: {
      participant_count: participantCount || 0,
      completion_count: completionCount || 0,
      abandonment_count: abandonmentCount || 0,
      completion_rate: completionRate,
      abandonment_rate: abandonmentRate,
      in_progress_count: (participantCount || 0) - (completionCount || 0) - (abandonmentCount || 0),
    },
    error: null,
  }
}

/**
 * Get quest leaderboard
 */
export async function getQuestLeaderboard(questId: string, limit = 10) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("user_quests")
    .select(`
      id,
      user_id,
      completed_at,
      profiles:user_id(username, display_name, avatar_url)
    `)
    .eq("quest_id", questId)
    .eq("status", "completed")
    .order("completed_at", { ascending: true })
    .limit(limit)

  if (error) {
    console.error("Error fetching quest leaderboard:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get user quest progress summary
 */
export async function getUserQuestSummary(userId?: string) {
  const supabase = await createServerClient()

  // If no userId provided, get the current user
  if (!userId) {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { data: null, error: "User not authenticated" }
    }

    userId = user.id
  }

  // Get counts of quests by status
  const { data: inProgressCount, error: inProgressError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "in_progress")

  const { data: completedCount, error: completedError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "completed")

  const { data: abandonedCount, error: abandonedError } = await supabase
    .from("user_quests")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "abandoned")

  if (inProgressError || completedError || abandonedError) {
    console.error("Error fetching user quest summary:", inProgressError || completedError || abandonedError)
    return { data: null, error: "Error fetching quest summary" }
  }

  // Get total points earned from quests
  const { data: userQuests } = await supabase
    .from("user_quests")
    .select(`
      quest_id,
      status
    `)
    .eq("user_id", userId)
    .eq("status", "completed")

  let totalPoints = 0

  if (userQuests && userQuests.length > 0) {
    // Get all quest rewards for completed quests
    const questIds = userQuests.map((uq) => uq.quest_id)

    const { data: rewards } = await supabase
      .from("quest_rewards")
      .select("quest_id, points")
      .in("quest_id", questIds)
      .eq("reward_type", "points")

    if (rewards) {
      totalPoints = rewards.reduce((sum, reward) => sum + (reward.points || 0), 0)
    }
  }

  return {
    data: {
      in_progress: inProgressCount || 0,
      completed: completedCount || 0,
      abandoned: abandonedCount || 0,
      total: (inProgressCount || 0) + (completedCount || 0) + (abandonedCount || 0),
      points_earned: totalPoints,
    },
    error: null,
  }
}

/**
 * Get recently completed quests (for activity feed)
 */
export async function getRecentlyCompletedQuests(limit = 5) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("user_quests")
    .select(`
      id,
      completed_at,
      user_id,
      profiles:user_id(username, display_name, avatar_url),
      quest:quest_id(title, difficulty, points)
    `)
    .eq("status", "completed")
    .order("completed_at", { ascending: false })
    .limit(limit)

  if (error) {
    console.error("Error fetching recently completed quests:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}
