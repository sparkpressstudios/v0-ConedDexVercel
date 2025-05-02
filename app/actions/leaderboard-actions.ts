"use server"

import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

/**
 * Get user leaderboard for a specific metric
 */
export async function getUserLeaderboard(metricId: string, limit = 10, offset = 0) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // First, get the user scores
  const { data: scoreData, error: scoreError } = await supabase
    .from("user_scores")
    .select("id, score, user_id, metric_id")
    .eq("metric_id", metricId)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (scoreError) {
    console.error("Error fetching user scores:", scoreError)
    return { data: null, error: scoreError.message }
  }

  if (!scoreData || scoreData.length === 0) {
    return { data: [], error: null }
  }

  // Get the metric details
  const { data: metricData, error: metricError } = await supabase
    .from("leaderboard_metrics")
    .select("name, description, icon")
    .eq("id", metricId)
    .single()

  if (metricError) {
    console.error("Error fetching metric details:", metricError)
    return { data: null, error: metricError.message }
  }

  // Get user profiles for the scores
  const userIds = scoreData.map((score) => score.user_id)
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds)

  if (profilesError) {
    console.error("Error fetching user profiles:", profilesError)
    return { data: null, error: profilesError.message }
  }

  // Map profiles to scores
  const profilesMap = profilesData.reduce((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {})

  // Combine the data
  const combinedData = scoreData.map((score) => ({
    id: score.id,
    score: score.score,
    profiles: profilesMap[score.user_id] || {
      id: score.user_id,
      username: "Unknown",
      full_name: null,
      avatar_url: null,
    },
    leaderboard_metrics: metricData,
  }))

  return { data: combinedData, error: null }
}

/**
 * Get team leaderboard for a specific metric
 */
export async function getTeamLeaderboard(metricId: string, limit = 10, offset = 0) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // First, get the team scores
  const { data: scoreData, error: scoreError } = await supabase
    .from("team_scores")
    .select("id, score, team_id, metric_id")
    .eq("metric_id", metricId)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (scoreError) {
    console.error("Error fetching team scores:", scoreError)
    return { data: null, error: scoreError.message }
  }

  if (!scoreData || scoreData.length === 0) {
    return { data: [], error: null }
  }

  // Get the metric details
  const { data: metricData, error: metricError } = await supabase
    .from("leaderboard_metrics")
    .select("name, description, icon")
    .eq("id", metricId)
    .single()

  if (metricError) {
    console.error("Error fetching metric details:", metricError)
    return { data: null, error: metricError.message }
  }

  // Get team details for the scores
  const teamIds = scoreData.map((score) => score.team_id)
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select("id, name, description, logo_url")
    .in("id", teamIds)

  if (teamsError) {
    console.error("Error fetching team details:", teamsError)
    return { data: null, error: teamsError.message }
  }

  // Map teams to scores
  const teamsMap = teamsData.reduce((acc, team) => {
    acc[team.id] = team
    return acc
  }, {})

  // Combine the data
  const combinedData = scoreData.map((score) => ({
    id: score.id,
    score: score.score,
    teams: teamsMap[score.team_id] || {
      id: score.team_id,
      name: "Unknown Team",
      description: null,
      logo_url: null,
    },
    leaderboard_metrics: metricData,
  }))

  return { data: combinedData, error: null }
}

/**
 * Get seasonal user leaderboard
 */
export async function getSeasonalUserLeaderboard(seasonId: string, metricId: string, limit = 10, offset = 0) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // First, get the seasonal user scores
  const { data: scoreData, error: scoreError } = await supabase
    .from("seasonal_user_scores")
    .select("id, score, user_id, metric_id, season_id")
    .eq("season_id", seasonId)
    .eq("metric_id", metricId)
    .order("score", { ascending: false })
    .range(offset, offset + limit - 1)

  if (scoreError) {
    console.error("Error fetching seasonal user scores:", scoreError)
    return { data: null, error: scoreError.message }
  }

  if (!scoreData || scoreData.length === 0) {
    return { data: [], error: null }
  }

  // Get the metric details
  const { data: metricData, error: metricError } = await supabase
    .from("leaderboard_metrics")
    .select("name, description, icon")
    .eq("id", metricId)
    .single()

  if (metricError) {
    console.error("Error fetching metric details:", metricError)
    return { data: null, error: metricError.message }
  }

  // Get the season details
  const { data: seasonData, error: seasonError } = await supabase
    .from("leaderboard_seasons")
    .select("name, description, start_date, end_date")
    .eq("id", seasonId)
    .single()

  if (seasonError) {
    console.error("Error fetching season details:", seasonError)
    return { data: null, error: seasonError.message }
  }

  // Get user profiles for the scores
  const userIds = scoreData.map((score) => score.user_id)
  const { data: profilesData, error: profilesError } = await supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url")
    .in("id", userIds)

  if (profilesError) {
    console.error("Error fetching user profiles:", profilesError)
    return { data: null, error: profilesError.message }
  }

  // Map profiles to scores
  const profilesMap = profilesData.reduce((acc, profile) => {
    acc[profile.id] = profile
    return acc
  }, {})

  // Combine the data
  const combinedData = scoreData.map((score) => ({
    id: score.id,
    score: score.score,
    profiles: profilesMap[score.user_id] || {
      id: score.user_id,
      username: "Unknown",
      full_name: null,
      avatar_url: null,
    },
    leaderboard_metrics: metricData,
    leaderboard_seasons: seasonData,
  }))

  return { data: combinedData, error: null }
}

/**
 * Get all available leaderboard metrics
 */
export async function getLeaderboardMetrics() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.from("leaderboard_metrics").select("*").order("name")

  if (error) {
    console.error("Error fetching leaderboard metrics:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get all available leaderboard seasons
 */
export async function getLeaderboardSeasons() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase
    .from("leaderboard_seasons")
    .select("*")
    .order("start_date", { ascending: false })

  if (error) {
    console.error("Error fetching leaderboard seasons:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get current active season
 */
export async function getCurrentSeason() {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data, error } = await supabase.from("leaderboard_seasons").select("*").eq("is_active", true).single()

  if (error) {
    console.error("Error fetching current season:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Update user score for a specific metric
 */
export async function updateUserScore(userId: string, metricId: string, scoreChange: number) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // First, check if the user already has a score for this metric
  const { data: existingScore, error: fetchError } = await supabase
    .from("user_scores")
    .select("id, score")
    .eq("user_id", userId)
    .eq("metric_id", metricId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    // PGRST116 is "no rows returned"
    console.error("Error fetching existing user score:", fetchError)
    return { data: null, error: fetchError.message }
  }

  let result

  if (existingScore) {
    // Update existing score
    const newScore = existingScore.score + scoreChange
    result = await supabase
      .from("user_scores")
      .update({ score: newScore, updated_at: new Date().toISOString() })
      .eq("id", existingScore.id)
      .select()
      .single()
  } else {
    // Create new score
    result = await supabase
      .from("user_scores")
      .insert({
        user_id: userId,
        metric_id: metricId,
        score: scoreChange,
      })
      .select()
      .single()
  }

  if (result.error) {
    console.error("Error updating user score:", result.error)
    return { data: null, error: result.error.message }
  }

  // Also update seasonal score if there's an active season
  const { data: currentSeason } = await getCurrentSeason()

  if (currentSeason) {
    await updateSeasonalUserScore(userId, currentSeason.id, metricId, scoreChange)
  }

  revalidatePath("/dashboard/leaderboard")
  return { data: result.data, error: null }
}

/**
 * Update seasonal user score
 */
async function updateSeasonalUserScore(userId: string, seasonId: string, metricId: string, scoreChange: number) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if the user already has a seasonal score
  const { data: existingScore, error: fetchError } = await supabase
    .from("seasonal_user_scores")
    .select("id, score")
    .eq("user_id", userId)
    .eq("season_id", seasonId)
    .eq("metric_id", metricId)
    .single()

  if (fetchError && fetchError.code !== "PGRST116") {
    console.error("Error fetching existing seasonal user score:", fetchError)
    return { data: null, error: fetchError.message }
  }

  let result

  if (existingScore) {
    // Update existing score
    const newScore = existingScore.score + scoreChange
    result = await supabase
      .from("seasonal_user_scores")
      .update({ score: newScore, updated_at: new Date().toISOString() })
      .eq("id", existingScore.id)
      .select()
      .single()
  } else {
    // Create new score
    result = await supabase
      .from("seasonal_user_scores")
      .insert({
        user_id: userId,
        season_id: seasonId,
        metric_id: metricId,
        score: scoreChange,
      })
      .select()
      .single()
  }

  if (result.error) {
    console.error("Error updating seasonal user score:", result.error)
    return { data: null, error: result.error.message }
  }

  return { data: result.data, error: null }
}

/**
 * Get user rank for a specific metric
 */
export async function getUserRank(userId: string, metricId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get user's score
  const { data: userScore, error: scoreError } = await supabase
    .from("user_scores")
    .select("score")
    .eq("user_id", userId)
    .eq("metric_id", metricId)
    .single()

  if (scoreError) {
    if (scoreError.code === "PGRST116") {
      // No score found
      return { data: { rank: null, score: 0 }, error: null }
    }
    console.error("Error fetching user score:", scoreError)
    return { data: null, error: scoreError.message }
  }

  // Count users with higher scores
  const { count, error: countError } = await supabase
    .from("user_scores")
    .select("*", { count: "exact", head: true })
    .eq("metric_id", metricId)
    .gt("score", userScore.score)

  if (countError) {
    console.error("Error counting higher scores:", countError)
    return { data: null, error: countError.message }
  }

  // Rank is count + 1 (1-based ranking)
  const rank = count !== null ? count + 1 : null

  return { data: { rank, score: userScore.score }, error: null }
}

/**
 * Get user ranking across all metrics
 */
export async function getUserRanking(userId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get all metrics
  const { data: metrics, error: metricsError } = await supabase.from("leaderboard_metrics").select("*")

  if (metricsError) {
    console.error("Error fetching metrics:", metricsError)
    return { data: null, error: metricsError.message }
  }

  const rankings: Record<string, any> = {}

  // For each metric, get the user's rank
  for (const metric of metrics) {
    // Get user's score
    const { data: userScore, error: scoreError } = await supabase
      .from("user_scores")
      .select("score")
      .eq("user_id", userId)
      .eq("metric_id", metric.id)
      .single()

    if (scoreError && scoreError.code !== "PGRST116") {
      console.error(`Error fetching user score for metric ${metric.id}:`, scoreError)
      continue
    }

    if (!userScore) {
      // User has no score for this metric
      continue
    }

    // Count total users with scores for this metric
    const { count: totalUsers, error: totalError } = await supabase
      .from("user_scores")
      .select("*", { count: "exact", head: true })
      .eq("metric_id", metric.id)

    if (totalError) {
      console.error(`Error counting total users for metric ${metric.id}:`, totalError)
      continue
    }

    // Count users with higher scores
    const { count: higherScores, error: countError } = await supabase
      .from("user_scores")
      .select("*", { count: "exact", head: true })
      .eq("metric_id", metric.id)
      .gt("score", userScore.score)

    if (countError) {
      console.error(`Error counting higher scores for metric ${metric.id}:`, countError)
      continue
    }

    // Rank is higherScores + 1 (1-based ranking)
    const rank = higherScores !== null ? higherScores + 1 : null

    // Calculate percentile (lower is better)
    const percentile = totalUsers ? (rank! / totalUsers) * 100 : null

    rankings[metric.id] = {
      rank,
      total_users: totalUsers,
      percentile,
      score: userScore.score,
      metric_name: metric.name,
    }
  }

  return { data: rankings, error: null }
}

/**
 * Get team ranking across all metrics
 */
export async function getTeamRanking(teamId: string) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Get all metrics
  const { data: metrics, error: metricsError } = await supabase.from("leaderboard_metrics").select("*")

  if (metricsError) {
    console.error("Error fetching metrics:", metricsError)
    return { data: null, error: metricsError.message }
  }

  const rankings: Record<string, any> = {}

  // For each metric, get the team's rank
  for (const metric of metrics) {
    // Get team's score
    const { data: teamScore, error: scoreError } = await supabase
      .from("team_scores")
      .select("score")
      .eq("team_id", teamId)
      .eq("metric_id", metric.id)
      .single()

    if (scoreError && scoreError.code !== "PGRST116") {
      console.error(`Error fetching team score for metric ${metric.id}:`, scoreError)
      continue
    }

    if (!teamScore) {
      // Team has no score for this metric
      continue
    }

    // Count total teams with scores for this metric
    const { count: totalTeams, error: totalError } = await supabase
      .from("team_scores")
      .select("*", { count: "exact", head: true })
      .eq("metric_id", metric.id)

    if (totalError) {
      console.error(`Error counting total teams for metric ${metric.id}:`, totalError)
      continue
    }

    // Count teams with higher scores
    const { count: higherScores, error: countError } = await supabase
      .from("team_scores")
      .select("*", { count: "exact", head: true })
      .eq("metric_id", metric.id)
      .gt("score", teamScore.score)

    if (countError) {
      console.error(`Error counting higher scores for metric ${metric.id}:`, countError)
      continue
    }

    // Rank is higherScores + 1 (1-based ranking)
    const rank = higherScores !== null ? higherScores + 1 : null

    // Calculate percentile (lower is better)
    const percentile = totalTeams ? (rank! / totalTeams) * 100 : null

    rankings[metric.id] = {
      rank,
      total_teams: totalTeams,
      percentile,
      score: teamScore.score,
      metric_name: metric.name,
    }
  }

  return { data: rankings, error: null }
}
