"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Compass, Trophy, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface QuestProgressWidgetProps {
  compact?: boolean
}

export function QuestProgressWidget({ compact = false }: QuestProgressWidgetProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [activeQuests, setActiveQuests] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    const fetchActiveQuests = async () => {
      setIsLoading(true)
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) {
          setIsLoading(false)
          return
        }

        // Get active quests with progress
        const { data, error } = await supabase
          .from("user_quests")
          .select(`
            *,
            quests(*)
          `)
          .eq("user_id", user.user.id)
          .eq("status", "in_progress")
          .order("updated_at", { ascending: false })
          .limit(compact ? 2 : 3)

        if (error) throw error

        setActiveQuests(data || [])
      } catch (error) {
        console.error("Error fetching quests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchActiveQuests()
  }, [supabase, compact])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Compass className="mr-2 h-5 w-5" />
            Active Quests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-16 w-full" />
            {!compact && <Skeleton className="h-16 w-full" />}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (compact) {
    return (
      <div className="space-y-3">
        {activeQuests.length > 0 ? (
          activeQuests.map((userQuest) => (
            <div key={userQuest.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">{userQuest.quests.title}</h4>
                <span className="text-xs text-muted-foreground">
                  {userQuest.progress_count}/{userQuest.quests.required_count}
                </span>
              </div>
              <Progress value={(userQuest.progress_count / userQuest.quests.required_count) * 100} />
            </div>
          ))
        ) : (
          <div className="flex items-center justify-between py-2">
            <p className="text-sm text-muted-foreground">No active quests</p>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => router.push("/dashboard/quests")}>
              Start a Quest
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Compass className="mr-2 h-5 w-5" />
          Active Quests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {activeQuests.length > 0 ? (
          <div className="space-y-4">
            {activeQuests.map((userQuest) => (
              <div key={userQuest.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">{userQuest.quests.title}</h4>
                  <span className="text-sm text-muted-foreground">
                    {userQuest.progress_count}/{userQuest.quests.required_count}
                  </span>
                </div>
                <Progress value={(userQuest.progress_count / userQuest.quests.required_count) * 100} />
                <p className="text-xs text-muted-foreground">{userQuest.quests.description}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Trophy className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Active Quests</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start a quest to earn badges and climb the leaderboard!
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/quests")}>
          <span>View All Quests</span>
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  )
}
