"use client"

import { useState } from "react"
import { updateUserScore } from "@/app/actions/leaderboard-actions"
import { useAuth } from "@/contexts/auth-context"

export function useLeaderboard() {
  const [isUpdating, setIsUpdating] = useState(false)
  const { user } = useAuth()

  const updateScore = async (metricId: string, scoreChange: number) => {
    if (!user) return { success: false, error: "User not authenticated" }

    setIsUpdating(true)
    try {
      const result = await updateUserScore(user.id, metricId, scoreChange)

      if (result.error) {
        return { success: false, error: result.error }
      }

      return { success: true, data: result.data }
    } catch (error) {
      console.error("Error updating leaderboard score:", error)
      return { success: false, error: "Failed to update score" }
    } finally {
      setIsUpdating(false)
    }
  }

  return {
    updateScore,
    isUpdating,
  }
}
