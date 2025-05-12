"use client"

import { useState, useEffect } from "react"
import { getQuestById, joinQuest } from "@/app/actions/quest-actions"
import { QuestHeader } from "./quests-header"
import { QuestObjectives } from "./quest-objectives"
import { QuestRewards } from "./quest-rewards"
import { QuestActions } from "./quest-actions"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "@/components/ui/use-toast"
import type { Quest, UserQuest } from "@/types/quests"

export function QuestDetails({
  questId,
  userQuest = null,
}: {
  questId: string
  userQuest?: UserQuest | null
}) {
  const [quest, setQuest] = useState<Quest | null>(null)
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    async function loadQuest() {
      setLoading(true)
      const { data, error } = await getQuestById(questId)
      if (error) {
        toast({
          title: "Error loading quest",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setQuest(data)
      }
      setLoading(false)
    }

    loadQuest()
  }, [questId])

  const handleJoinQuest = async () => {
    setJoining(true)
    const { data, error } = await joinQuest(questId)

    if (error) {
      toast({
        title: "Failed to join quest",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Quest joined!",
        description: "You have successfully joined this quest.",
      })
      // Refresh the page to update the user's quests
      window.location.reload()
    }
    setJoining(false)
  }

  if (loading) {
    return (
      <div>
        <div className="mb-8">
          <Skeleton className="mb-2 h-10 w-3/4" />
          <Skeleton className="mb-4 h-5 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
        </div>

        <Tabs defaultValue="objectives">
          <TabsList className="mb-4">
            <TabsTrigger value="objectives">Objectives</TabsTrigger>
            <TabsTrigger value="rewards">Rewards</TabsTrigger>
          </TabsList>

          <TabsContent value="objectives">
            <div className="rounded-lg border p-4">
              <Skeleton className="mb-4 h-6 w-1/3" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="mb-1 h-5 w-1/2" />
                      <Skeleton className="h-4 w-3/4" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="rewards">
            <div className="rounded-lg border p-4">
              <Skeleton className="mb-4 h-6 w-1/3" />
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2].map((i) => (
                  <div key={i} className="rounded-lg border p-4">
                    <Skeleton className="mb-2 h-5 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    )
  }

  if (!quest) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">Quest not found</h3>
        <p className="text-muted-foreground">The quest you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  const userJoined = !!userQuest
  const isCompleted = userQuest?.status === "completed"
  const isAbandoned = userQuest?.status === "abandoned"

  return (
    <div>
      <QuestHeader quest={quest} userJoined={userJoined} />

      <Tabs defaultValue="objectives">
        <TabsList className="mb-4">
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
        </TabsList>

        <TabsContent value="objectives">
          <QuestObjectives quest={quest} userQuest={userQuest} isCompleted={isCompleted} isAbandoned={isAbandoned} />
        </TabsContent>

        <TabsContent value="rewards">
          <QuestRewards quest={quest} isCompleted={isCompleted} />
        </TabsContent>
      </Tabs>

      <QuestActions questId={questId} userQuest={userQuest} onJoin={handleJoinQuest} joining={joining} />
    </div>
  )
}
