"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Award, CheckCircle, Clock, AlertTriangle } from "lucide-react"
import { getUserQuestSummary, getUserQuests } from "@/app/actions/quest-actions"
import { toast } from "@/components/ui/use-toast"

interface QuestAchievementsProps {
  userId: string
}

export function QuestAchievements({ userId }: QuestAchievementsProps) {
  const [summary, setSummary] = useState<any>(null)
  const [recentQuests, setRecentQuests] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Get quest summary
      const { data: summaryData, error: summaryError } = await getUserQuestSummary(userId)

      if (summaryError) {
        toast({
          title: "Error loading quest summary",
          description: summaryError,
          variant: "destructive",
        })
      } else if (summaryData) {
        setSummary(summaryData)
      }

      // Get recent quests
      const { data: questsData, error: questsError } = await getUserQuests(userId)

      if (questsError) {
        toast({
          title: "Error loading quests",
          description: questsError,
          variant: "destructive",
        })
      } else if (questsData) {
        // Sort by most recently updated
        const sorted = [...questsData].sort((a, b) => {
          const dateA = a.completed_at
            ? new Date(a.completed_at).getTime()
            : a.joined_at
              ? new Date(a.joined_at).getTime()
              : 0
          const dateB = b.completed_at
            ? new Date(b.completed_at).getTime()
            : b.joined_at
              ? new Date(b.joined_at).getTime()
              : 0
          return dateB - dateA
        })

        setRecentQuests(sorted.slice(0, 5)) // Take only the 5 most recent
      }

      setLoading(false)
    }

    if (userId) {
      loadData()
    }
  }, [userId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <Skeleton className="h-[200px] w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  // If no quests, show a message
  if (!summary || summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quest Achievements</CardTitle>
          <CardDescription>Track quest progress and rewards</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Quests Yet</h3>
          <p className="text-muted-foreground">This explorer hasn't joined any quests yet</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quest Achievements</span>
          {summary.points_earned > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Award className="h-4 w-4" />
              <span>{summary.points_earned} points earned</span>
            </Badge>
          )}
        </CardTitle>
        <CardDescription>Track quest progress and rewards</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 rounded-full bg-green-100 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold">{summary.completed}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 rounded-full bg-blue-100 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold">{summary.in_progress}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 rounded-full bg-amber-100 mb-2">
                  <AlertTriangle className="h-5 w-5 text-amber-600" />
                </div>
                <p className="text-sm font-medium text-muted-foreground">Abandoned</p>
                <p className="text-2xl font-bold">{summary.abandoned}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <h3 className="font-medium mb-3">Recent Quests</h3>
        {recentQuests.length > 0 ? (
          <div className="space-y-4">
            {recentQuests.map((userQuest) => {
              const quest = userQuest.quest
              if (!quest) return null

              // Calculate progress for in-progress quests
              let progressPercent = 0
              if (userQuest.status === "in_progress") {
                const objectives = quest.objectives || []
                const progress = userQuest.progress || {}

                const completedCount = objectives.filter(
                  (obj) => progress[obj.id] && progress[obj.id].is_completed,
                ).length

                progressPercent = objectives.length > 0 ? Math.round((completedCount / objectives.length) * 100) : 0
              }

              // Determine status badge
              let statusBadge
              switch (userQuest.status) {
                case "completed":
                  statusBadge = (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                      <CheckCircle className="h-3 w-3 mr-1" /> Completed
                    </Badge>
                  )
                  break
                case "in_progress":
                  statusBadge = (
                    <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                      <Clock className="h-3 w-3 mr-1" /> In Progress
                    </Badge>
                  )
                  break
                case "abandoned":
                  statusBadge = (
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200">
                      <AlertTriangle className="h-3 w-3 mr-1" /> Abandoned
                    </Badge>
                  )
                  break
                default:
                  statusBadge = <Badge variant="outline">Unknown</Badge>
              }

              return (
                <div key={userQuest.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium line-clamp-1">{quest.title}</h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">{quest.description}</p>
                    </div>
                    {statusBadge}
                  </div>

                  {userQuest.status === "in_progress" && (
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progress</span>
                        <span>{progressPercent}%</span>
                      </div>
                      <Progress value={progressPercent} className="h-1.5" />
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {quest.difficulty}
                    </Badge>
                    {quest.points && (
                      <Badge variant="outline" className="text-xs">
                        {quest.points} points
                      </Badge>
                    )}
                    {quest.rewards && quest.rewards.length > 0 && (
                      <Badge variant="outline" className="text-xs">
                        {quest.rewards.length} rewards
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-muted-foreground">No recent quests to display</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
