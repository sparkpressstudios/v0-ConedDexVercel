"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { abandonQuest } from "@/app/actions/quest-actions"
import { toast } from "@/components/ui/use-toast"
import type { UserQuest } from "@/types/quests"

export function QuestActions({
  questId,
  userQuest = null,
  onJoin,
  joining = false,
}: {
  questId: string
  userQuest?: UserQuest | null
  onJoin?: () => void
  joining?: boolean
}) {
  const [abandoning, setAbandoning] = useState(false)

  const handleAbandonQuest = async () => {
    if (!userQuest) return

    setAbandoning(true)
    const { data, error } = await abandonQuest(userQuest.id)

    if (error) {
      toast({
        title: "Failed to abandon quest",
        description: error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Quest abandoned",
        description: "You have abandoned this quest.",
      })
      // Refresh the page to update the UI
      window.location.reload()
    }
    setAbandoning(false)
  }

  if (!userQuest) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Join this Quest</CardTitle>
          <CardDescription>Join this quest to start tracking your progress and earn rewards.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onJoin} disabled={joining} className="w-full">
            {joining ? "Joining..." : "Join Quest"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (userQuest.status === "completed") {
    return (
      <Card className="mt-8 border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle>Quest Completed!</CardTitle>
          <CardDescription>Congratulations! You have completed this quest and earned all the rewards.</CardDescription>
        </CardHeader>
        <CardFooter>
          <Button variant="outline" className="w-full" asChild>
            <a href="/dashboard/quests">Browse More Quests</a>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (userQuest.status === "abandoned") {
    return (
      <Card className="mt-8 border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle>Quest Abandoned</CardTitle>
          <CardDescription>
            You have abandoned this quest. You can join it again if you change your mind.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button onClick={onJoin} disabled={joining} className="w-full">
            {joining ? "Joining..." : "Join Again"}
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Quest In Progress</CardTitle>
        <CardDescription>Complete all objectives to finish this quest and earn rewards.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          You can abandon this quest at any time, but your progress will be lost.
        </p>
      </CardContent>
      <CardFooter>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="outline" className="w-full text-red-600 hover:bg-red-50 hover:text-red-700">
              Abandon Quest
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Abandon Quest</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to abandon this quest? Your progress will be lost and you won't receive any
                rewards.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAbandonQuest}
                className="bg-red-600 hover:bg-red-700"
                disabled={abandoning}
              >
                {abandoning ? "Abandoning..." : "Abandon Quest"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  )
}
