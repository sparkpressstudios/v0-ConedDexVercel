import { createClient } from "@/lib/supabase/client"

// Update leaderboard when a user logs a new flavor
export const updateLeaderboardOnFlavorLog = async (userId: string): Promise<void> => {
  try {
    const supabase = createClient()

    // Get the user's current flavor count
    const { count, error: countError } = await supabase
      .from("flavor_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)

    if (countError) {
      throw countError
    }

    // Update or create the leaderboard entry for flavors logged
    const { error: upsertError } = await supabase.from("leaderboard_entries").upsert({
      user_id: userId,
      metric_id: "flavors_logged",
      value: count || 0,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) {
      throw upsertError
    }

    // Update the user's position in the leaderboard
    await updateLeaderboardPositions("flavors_logged")

    // Check if the user has earned any badges based on flavor count
    await checkForBadgeAwards(userId, count || 0)
  } catch (error) {
    console.error("Error updating leaderboard:", error)
  }
}

// Update leaderboard when a user completes a quest
export const updateLeaderboardOnQuestCompleted = async (userId: string): Promise<void> => {
  try {
    const supabase = createClient()

    // Get the user's current completed quests count
    const { count, error: countError } = await supabase
      .from("user_quests")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("status", "completed")

    if (countError) {
      throw countError
    }

    // Update or create the leaderboard entry for quests completed
    const { error: upsertError } = await supabase.from("leaderboard_entries").upsert({
      user_id: userId,
      metric_id: "quests_completed",
      value: count || 0,
      updated_at: new Date().toISOString(),
    })

    if (upsertError) {
      throw upsertError
    }

    // Update the user's position in the leaderboard
    await updateLeaderboardPositions("quests_completed")

    // Check if the user has earned any badges based on quest count
    await checkForQuestBadgeAwards(userId, count || 0)
  } catch (error) {
    console.error("Error updating leaderboard for quests:", error)
  }
}

// Update positions for all users for a specific metric
export const updateLeaderboardPositions = async (metricId: string): Promise<void> => {
  try {
    const supabase = createClient()

    // Get all entries for this metric, ordered by value (descending)
    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("id, user_id, value")
      .eq("metric_id", metricId)
      .order("value", { ascending: false })

    if (error) {
      throw error
    }

    if (!data || data.length === 0) {
      return
    }

    // Update each entry with its position
    const updates = data.map((entry, index) => ({
      id: entry.id,
      position: index + 1,
    }))

    // Update in batches to avoid rate limits
    const batchSize = 100
    for (let i = 0; i < updates.length; i += batchSize) {
      const batch = updates.slice(i, i + batchSize)

      const { error: batchError } = await supabase.from("leaderboard_entries").upsert(batch)

      if (batchError) {
        throw batchError
      }
    }
  } catch (error) {
    console.error("Error updating leaderboard positions:", error)
  }
}

// Check if a user has earned any badges based on their flavor count
export const checkForBadgeAwards = async (userId: string, flavorCount: number): Promise<void> => {
  try {
    const supabase = createClient()

    // Define badge thresholds
    const flavorBadges = [
      { id: "flavor_novice", threshold: 5, name: "Flavor Novice" },
      { id: "flavor_enthusiast", threshold: 25, name: "Flavor Enthusiast" },
      { id: "flavor_connoisseur", threshold: 50, name: "Flavor Connoisseur" },
      { id: "flavor_master", threshold: 100, name: "Flavor Master" },
    ]

    // Check each badge
    for (const badge of flavorBadges) {
      if (flavorCount >= badge.threshold) {
        // Check if the user already has this badge
        const { data, error } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", userId)
          .eq("badge_id", badge.id)
          .maybeSingle()

        if (error) {
          throw error
        }

        // If the user doesn't have the badge, award it
        if (!data) {
          const { error: awardError } = await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
            awarded_at: new Date().toISOString(),
          })

          if (awardError) {
            throw awardError
          }

          // Create a notification for the user
          const { error: notificationError } = await supabase.from("notifications").insert({
            user_id: userId,
            type: "badge_awarded",
            title: "New Badge Earned!",
            message: `Congratulations! You've earned the "${badge.name}" badge.`,
            data: { badge_id: badge.id },
            read: false,
            created_at: new Date().toISOString(),
          })

          if (notificationError) {
            throw notificationError
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking for badge awards:", error)
  }
}

// Check if a user has earned any badges based on their quest count
export const checkForQuestBadgeAwards = async (userId: string, questCount: number): Promise<void> => {
  try {
    const supabase = createClient()

    // Define badge thresholds
    const questBadges = [
      { id: "quest_beginner", threshold: 3, name: "Quest Beginner" },
      { id: "quest_adventurer", threshold: 10, name: "Quest Adventurer" },
      { id: "quest_explorer", threshold: 25, name: "Quest Explorer" },
      { id: "quest_champion", threshold: 50, name: "Quest Champion" },
    ]

    // Check each badge
    for (const badge of questBadges) {
      if (questCount >= badge.threshold) {
        // Check if the user already has this badge
        const { data, error } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", userId)
          .eq("badge_id", badge.id)
          .maybeSingle()

        if (error) {
          throw error
        }

        // If the user doesn't have the badge, award it
        if (!data) {
          const { error: awardError } = await supabase.from("user_badges").insert({
            user_id: userId,
            badge_id: badge.id,
            awarded_at: new Date().toISOString(),
          })

          if (awardError) {
            throw awardError
          }

          // Create a notification for the user
          const { error: notificationError } = await supabase.from("notifications").insert({
            user_id: userId,
            type: "badge_awarded",
            title: "New Badge Earned!",
            message: `Congratulations! You've earned the "${badge.name}" badge.`,
            data: { badge_id: badge.id },
            read: false,
            created_at: new Date().toISOString(),
          })

          if (notificationError) {
            throw notificationError
          }
        }
      }
    }
  } catch (error) {
    console.error("Error checking for quest badge awards:", error)
  }
}

// Get a user's rank for a specific metric
export const getUserRank = async (userId: string, metricId: string): Promise<number | null> => {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select("position")
      .eq("user_id", userId)
      .eq("metric_id", metricId)
      .maybeSingle()

    if (error) {
      throw error
    }

    return data?.position || null
  } catch (error) {
    console.error("Error getting user rank:", error)
    return null
  }
}

// Get the top users for a specific metric
export const getTopUsers = async (metricId: string, limit = 10): Promise<any[]> => {
  try {
    const supabase = createClient()

    const { data, error } = await supabase
      .from("leaderboard_entries")
      .select(`
        position,
        value,
        user_id,
        profiles:user_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .eq("metric_id", metricId)
      .order("position", { ascending: true })
      .limit(limit)

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error getting top users:", error)
    return []
  }
}

// Get a user's position relative to others (e.g., users above and below)
export const getUserNeighbors = async (
  userId: string,
  metricId: string,
  count = 2,
): Promise<{ above: any[]; below: any[] }> => {
  try {
    const supabase = createClient()

    // Get the user's current position
    const { data: userData, error: userError } = await supabase
      .from("leaderboard_entries")
      .select("position")
      .eq("user_id", userId)
      .eq("metric_id", metricId)
      .maybeSingle()

    if (userError || !userData) {
      throw userError || new Error("User not found in leaderboard")
    }

    const userPosition = userData.position

    // Get users above
    const { data: aboveData, error: aboveError } = await supabase
      .from("leaderboard_entries")
      .select(`
        position,
        value,
        user_id,
        profiles:user_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .eq("metric_id", metricId)
      .lt("position", userPosition)
      .order("position", { ascending: false })
      .limit(count)

    if (aboveError) {
      throw aboveError
    }

    // Get users below
    const { data: belowData, error: belowError } = await supabase
      .from("leaderboard_entries")
      .select(`
        position,
        value,
        user_id,
        profiles:user_id (
          username,
          avatar_url,
          full_name
        )
      `)
      .eq("metric_id", metricId)
      .gt("position", userPosition)
      .order("position", { ascending: true })
      .limit(count)

    if (belowError) {
      throw belowError
    }

    return {
      above: aboveData || [],
      below: belowData || [],
    }
  } catch (error) {
    console.error("Error getting user neighbors:", error)
    return { above: [], below: [] }
  }
}
