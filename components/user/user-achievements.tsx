"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Award } from "lucide-react"
import { Progress } from "@/components/ui/progress"

type Achievement = {
  id: string
  name: string
  description: string
  image_url?: string
  completed: boolean
  progress: number
  total_required: number
}

export function UserAchievementsComponent() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadAchievements() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        // Get user's achievements
        const { data: userAchievements, error: achievementsError } = await supabase
          .from("user_achievements")
          .select(`
            achievement_id,
            completed,
            progress,
            achievements:achievement_id (
              id,
              name,
              description,
              image_url,
              required_count
            )
          `)
          .eq("user_id", user.id)
          .order("completed", { ascending: false })

        if (achievementsError) {
          throw new Error(achievementsError.message)
        }

        if (!userAchievements || userAchievements.length === 0) {
          // If no achievements found, get all available achievements and set progress to 0
          const { data: allAchievements, error: allAchievementsError } = await supabase
            .from("achievements")
            .select("id, name, description, image_url, required_count")
            .limit(5)

          if (allAchievementsError) {
            throw new Error(allAchievementsError.message)
          }

          const formattedAchievements =
            allAchievements?.map((achievement) => ({
              id: achievement.id,
              name: achievement.name,
              description: achievement.description,
              image_url: achievement.image_url,
              completed: false,
              progress: 0,
              total_required: achievement.required_count,
            })) || []

          setAchievements(formattedAchievements)
          setLoading(false)
          return
        }

        // Format achievements
        const formattedAchievements = userAchievements.map((ua) => {
          const achievement = ua.achievements as any
          return {
            id: achievement.id,
            name: achievement.name,
            description: achievement.description,
            image_url: achievement.image_url,
            completed: ua.completed,
            progress: ua.progress,
            total_required: achievement.required_count,
          }
        })

        setAchievements(formattedAchievements.slice(0, 5))
      } catch (err) {
        console.error("Error loading achievements:", err)
        setError(err instanceof Error ? err.message : "Failed to load achievements")
      } finally {
        setLoading(false)
      }
    }

    loadAchievements()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Achievements</CardTitle>
        <CardDescription>Track your ConeDex progress</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[140px]" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
                <Skeleton className="h-2 w-full" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : achievements.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>No achievements available yet.</p>
            <p className="mt-2">Start exploring to unlock achievements!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-10 w-10 rounded-full flex items-center justify-center ${achievement.completed ? "bg-green-100" : "bg-muted"}`}
                  >
                    {achievement.image_url ? (
                      <img
                        src={achievement.image_url || "/placeholder.svg"}
                        alt={achievement.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <Award
                        className={`h-5 w-5 ${achievement.completed ? "text-green-600" : "text-muted-foreground"}`}
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium">{achievement.name}</h4>
                      <span className="text-xs font-medium">
                        {achievement.progress}/{achievement.total_required}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{achievement.description}</p>
                  </div>
                </div>
                <Progress
                  value={(achievement.progress / achievement.total_required) * 100}
                  className="h-2"
                  indicatorClassName={achievement.completed ? "bg-green-500" : undefined}
                />
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add default export
export default function UserAchievements() {
  return <UserAchievementsComponent />
}
