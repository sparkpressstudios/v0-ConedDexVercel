"use client"

import { useState } from "react"
import { CheckCircle2, Circle, Target, MapPin, IceCream, Star, MessageSquare, Award } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { updateQuestProgress } from "@/app/actions/quest-actions"
import { toast } from "@/components/ui/use-toast"
import type { Quest, UserQuest, QuestObjective, ObjectiveType } from "@/types/quests"

export function QuestObjectives({
  quest,
  userQuest = null,
  isCompleted = false,
  isAbandoned = false,
}: {
  quest: Quest
  userQuest?: UserQuest | null
  isCompleted?: boolean
  isAbandoned?: boolean
}) {
  const [updating, setUpdating] = useState<string | null>(null)

  const handleUpdateProgress = async (objectiveId: string) => {
    if (!userQuest) return

    setUpdating(objectiveId)
    const { data, error } = await updateQuestProgress(userQuest.id, objectiveId)

    if (error) {
      toast({
        title: "Failed to update progress",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Progress updated",
        description: "Your quest progress has been updated.",
      })
      // Refresh the page to show updated progress
      window.location.reload()
    }
    setUpdating(null)
  }

  const getObjectiveIcon = (type: ObjectiveType) => {
    switch (type) {
      case "visit_shop":
        return <MapPin className="h-5 w-5 text-blue-500" />
      case "try_flavor":
        return <IceCream className="h-5 w-5 text-pink-500" />
      case "try_flavor_category":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "visit_location":
        return <MapPin className="h-5 w-5 text-green-500" />
      case "log_reviews":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "earn_points":
        return <Award className="h-5 w-5 text-orange-500" />
      default:
        return <Target className="h-5 w-5 text-gray-500" />
    }
  }

  if (!quest.objectives || quest.objectives.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No objectives</h3>
        <p className="text-muted-foreground">This quest doesn't have any objectives.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-medium">Quest Objectives</h3>

        {userQuest && !isAbandoned && (
          <div className="mb-6">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {
                  quest.objectives.filter((obj) => {
                    const progress = userQuest.progress?.[obj.id]
                    return progress && progress.is_completed
                  }).length
                }{" "}
                / {quest.objectives.length} completed
              </span>
            </div>
            <Progress
              value={
                (quest.objectives.filter((obj) => {
                  const progress = userQuest.progress?.[obj.id]
                  return progress && progress.is_completed
                }).length /
                  quest.objectives.length) *
                100
              }
              className="h-2"
            />
          </div>
        )}

        <div className="space-y-4">
          {quest.objectives.map((objective) => (
            <ObjectiveItem
              key={objective.id}
              objective={objective}
              userQuest={userQuest}
              onUpdateProgress={handleUpdateProgress}
              updating={updating === objective.id}
              isCompleted={isCompleted}
              isAbandoned={isAbandoned}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ObjectiveItem({
  objective,
  userQuest,
  onUpdateProgress,
  updating = false,
  isCompleted = false,
  isAbandoned = false,
}: {
  objective: QuestObjective
  userQuest: UserQuest | null
  onUpdateProgress: (id: string) => void
  updating?: boolean
  isCompleted?: boolean
  isAbandoned?: boolean
}) {
  const progress = userQuest?.progress?.[objective.id]
  const currentCount = progress?.current_count || 0
  const objectiveCompleted = progress?.is_completed || false

  const getObjectiveIcon = (type: ObjectiveType) => {
    switch (type) {
      case "visit_shop":
        return <MapPin className="h-5 w-5 text-blue-500" />
      case "try_flavor":
        return <IceCream className="h-5 w-5 text-pink-500" />
      case "try_flavor_category":
        return <Star className="h-5 w-5 text-yellow-500" />
      case "visit_location":
        return <MapPin className="h-5 w-5 text-green-500" />
      case "log_reviews":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      case "earn_points":
        return <Award className="h-5 w-5 text-orange-500" />
      default:
        return <Target className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <Card className={`border ${objectiveCompleted ? "border-green-200 bg-green-50" : ""}`}>
      <CardHeader className="flex flex-row items-start space-y-0 pb-2">
        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border">
          {getObjectiveIcon(objective.objective_type)}
        </div>
        <div className="flex-1">
          <CardTitle className="text-base">{objective.title}</CardTitle>
          {objective.description && <CardDescription>{objective.description}</CardDescription>}
        </div>
        {userQuest && !isAbandoned && (
          <div className="ml-4 flex h-6 items-center">
            {objectiveCompleted ? (
              <CheckCircle2 className="h-6 w-6 text-green-500" />
            ) : (
              <Circle className="h-6 w-6 text-gray-300" />
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {userQuest && !isAbandoned ? (
              <span>
                Progress: {currentCount} / {objective.target_count}
              </span>
            ) : (
              <span>Target: {objective.target_count}</span>
            )}
          </div>

          {userQuest && !isCompleted && !isAbandoned && !objectiveCompleted && (
            <Button size="sm" variant="outline" onClick={() => onUpdateProgress(objective.id)} disabled={updating}>
              {updating ? "Updating..." : "Mark Progress"}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
