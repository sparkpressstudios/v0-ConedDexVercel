import { updateUserScore } from "@/app/actions/leaderboard-actions"

export const LeaderboardMetrics = {
  FLAVORS_LOGGED: "flavors_logged",
  SHOPS_VISITED: "shops_visited",
  AVERAGE_RATING: "average_rating",
  BADGES_EARNED: "badges_earned",
  REVIEWS_WRITTEN: "reviews_written",
  CONSECUTIVE_DAYS: "consecutive_days",
  QUESTS_COMPLETED: "quests_completed",
}

export async function updateLeaderboardOnFlavorLog(userId: string) {
  await updateUserScore(userId, LeaderboardMetrics.FLAVORS_LOGGED, 1)
}

export async function updateLeaderboardOnShopVisit(userId: string) {
  await updateUserScore(userId, LeaderboardMetrics.SHOPS_VISITED, 1)
}

export async function updateLeaderboardOnBadgeEarned(userId: string) {
  await updateUserScore(userId, LeaderboardMetrics.BADGES_EARNED, 1)
}

export async function updateLeaderboardOnReviewWritten(userId: string) {
  await updateUserScore(userId, LeaderboardMetrics.REVIEWS_WRITTEN, 1)
}

export async function updateLeaderboardOnRating(userId: string, rating: number) {
  // This is a bit more complex as we need to calculate the average
  // For simplicity, we're just incrementing the score by the rating value
  await updateUserScore(userId, LeaderboardMetrics.AVERAGE_RATING, rating)
}

export async function updateLeaderboardOnQuestCompleted(userId: string, points = 1) {
  // Update the quests completed metric
  await updateUserScore(userId, LeaderboardMetrics.QUESTS_COMPLETED, 1)

  // If the quest has points, add those to the user's score
  if (points > 1) {
    // We could create a separate metric for quest points if needed
    await updateUserScore(userId, LeaderboardMetrics.QUESTS_COMPLETED, points - 1)
  }
}
