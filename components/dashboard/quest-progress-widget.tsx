"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserQuestSummary, getUserQuests } from "@/app/actions/quest-actions"
import { Award, CheckCircle, Clock, ChevronRight } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export function QuestProgressWidget() {
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<any>(null)
  const [activeQuests, setActiveQuests] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)

      // Get quest summary
      const { data: summaryData, error: summaryError } = await getUserQuestSummary()

      if (summaryError) {
        toast({
          title: "Error loading quest summary",
          description: summaryError,
          variant: "destructive",
        })
      } else if (summaryData) {
        setSummary(summaryData)
      }

      // Get active quests
      const { data: questsData, error: questsError } = await getUserQuests("current")

      if (questsError) {
        toast({
          title: "Error loading quests",
          description: questsError,
          variant: "destructive",
        })
      } else if (questsData) {
        // Filter for in-progress quests and sort by joined date
        const inProgress = questsData
          .filter((q) => q.status === "in_progress")
          .sort((a, b) => new Date(b.joined_at).getTime() - new Date(a.joined_at).getTime())
          .slice(0, 3) // Take only the 3 most recent

        setActiveQuests(inProgress)
      }

      setLoading(false)
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-[180px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-5 w-[50px]" />
            </div>
            <Skeleton className="h-2 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        </CardContent>
        <CardFooter>
          <Skeleton className="h-9 w-full" />
        </CardFooter>
      </Card>
    )
  }

  // If no quests, show a CTA to join quests
  if (!summary || summary.total === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Quests</CardTitle>
          <CardDescription>Complete quests to earn rewards and badges</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-6">
          <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Quests Yet</h3>
          <p className="text-muted-foreground mb-4">Join quests to earn points, badges, and other rewards</p>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/quests">Browse Quests</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Quests</span>
          {summary.points_earned > 0 && (
            <span className="text-sm font-normal bg-amber-100 text-amber-800 px-2 py-1 rounded-md flex items-center">
              <Award className="h-4 w-4 mr-1" /> {summary.points_earned} points earned
            </span>
          )}
        </CardTitle>
        <CardDescription>
          {summary.completed} completed, {summary.in_progress} in progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeQuests.length > 0 ? (
          <div className="space-y-4">
            {activeQuests.map((userQuest) => {
              const quest = userQuest.quest
              if (!quest) return null

              // Calculate progress
              const objectives = quest.objectives || []
              const progress = userQuest.progress || {}

              const completedCount = objectives.filter(
                (obj) => progress[obj.id] && progress[obj.id].is_completed,
              ).length

              const progressPercent = objectives.length > 0 ? Math.round((completedCount / objectives.length) * 100) : 0

              return (
                <div key={userQuest.id} className="border rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium line-clamp-1">{quest.title}</h4>
                    <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded flex items-center">
                      <Clock className="h-3 w-3 mr-1" /> In Progress
                    </span>
                  </div>

                  <div className="mb-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span>
                        {completedCount} of {objectives.length} objectives
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <Progress value={progressPercent} className="h-1.5" />
                  </div>

                  <Button variant="ghost" size="sm" className="w-full mt-1" asChild>
                    <Link href={`/dashboard/quests/${quest.id}`}>
                      Continue <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-4">
            <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p className="text-muted-foreground">
              {summary.completed > 0 ? "You've completed all your active quests!" : "You don't have any active quests."}
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href="/dashboard/quests">View All Quests</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
