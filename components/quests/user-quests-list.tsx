"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { CheckCircle2, Clock, XCircle, Award, ChevronRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserQuests, abandonQuest } from "@/app/actions/quest-actions"
import type { UserQuest } from "@/types/quests"
import { toast } from "@/components/ui/use-toast"
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

export function UserQuestsList() {
  const [userQuests, setUserQuests] = useState<UserQuest[]>([])
  const [loading, setLoading] = useState(true)
  const [abandoning, setAbandoning] = useState<string | null>(null)

  useEffect(() => {
    async function loadUserQuests() {
      setLoading(true)
      const { data, error } = await getUserQuests("current")
      if (error) {
        toast({
          title: "Error loading quests",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setUserQuests(data)
      }
      setLoading(false)
    }

    loadUserQuests()
  }, [])

  const handleAbandonQuest = async (userQuestId: string) => {
    setAbandoning(userQuestId)
    const { data, error } = await abandonQuest(userQuestId)

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
      // Update the local state
      setUserQuests(userQuests.map((uq) => (uq.id === userQuestId ? { ...uq, status: "abandoned" } : uq)))
    }
    setAbandoning(null)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="pb-2">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="mb-2 h-24 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-5 w-16" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-9 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  const activeQuests = userQuests.filter((uq) => uq.status === "in_progress")
  const completedQuests = userQuests.filter((uq) => uq.status === "completed")
  const abandonedQuests = userQuests.filter((uq) => uq.status === "abandoned")

  return (
    <Tabs defaultValue="active" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="active">Active Quests</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
        <TabsTrigger value="abandoned">Abandoned</TabsTrigger>
      </TabsList>

      <TabsContent value="active">
        {activeQuests.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No active quests</h3>
            <p className="text-muted-foreground">Join a quest to start your adventure!</p>
            <Button asChild className="mt-4">
              <Link href="/dashboard/quests">Browse Quests</Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeQuests.map((userQuest) => (
              <UserQuestCard
                key={userQuest.id}
                userQuest={userQuest}
                onAbandon={handleAbandonQuest}
                abandoning={abandoning === userQuest.id}
              />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="completed">
        {completedQuests.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No completed quests</h3>
            <p className="text-muted-foreground">Complete quests to see them here!</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {completedQuests.map((userQuest) => (
              <UserQuestCard key={userQuest.id} userQuest={userQuest} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="abandoned">
        {abandonedQuests.length === 0 ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <h3 className="mb-2 text-lg font-medium">No abandoned quests</h3>
            <p className="text-muted-foreground">You haven't abandoned any quests.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {abandonedQuests.map((userQuest) => (
              <UserQuestCard key={userQuest.id} userQuest={userQuest} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function UserQuestCard({
  userQuest,
  onAbandon,
  abandoning = false,
}: {
  userQuest: UserQuest
  onAbandon?: (id: string) => void
  abandoning?: boolean
}) {
  const quest = userQuest.quest
  if (!quest) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "hard":
        return "bg-orange-100 text-orange-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusBadge = () => {
    switch (userQuest.status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800">
            <CheckCircle2 className="mr-1 h-3 w-3" /> Completed
          </Badge>
        )
      case "abandoned":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800">
            <XCircle className="mr-1 h-3 w-3" /> Abandoned
          </Badge>
        )
      default:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800">
            <Clock className="mr-1 h-3 w-3" /> In Progress
          </Badge>
        )
    }
  }

  // Calculate progress
  const calculateProgress = () => {
    if (!quest.objectives || quest.objectives.length === 0) return 100

    const progress = userQuest.progress || {}
    let completed = 0

    quest.objectives.forEach((obj) => {
      const objProgress = progress[obj.id]
      if (objProgress && objProgress.is_completed) {
        completed++
      }
    })

    return Math.round((completed / quest.objectives.length) * 100)
  }

  const progressPercent = calculateProgress()

  return (
    <Card
      className={`overflow-hidden transition-all ${userQuest.status === "completed" ? "border-green-200" : userQuest.status === "abandoned" ? "border-red-200 opacity-75" : "hover:shadow-md"}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1">{quest.title}</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription className="flex items-center gap-1">
          {userQuest.status === "completed" && userQuest.completed_at ? (
            <>Completed {formatDate(userQuest.completed_at)}</>
          ) : (
            <>Joined {formatDate(userQuest.joined_at)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{quest.description}</p>

        {userQuest.status === "in_progress" && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span>Progress</span>
              <span>{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
            {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
          </Badge>
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            <Award className="mr-1 h-3 w-3" /> {quest.points} points
          </Badge>
        </div>
      </CardContent>
      <CardFooter>
        {userQuest.status === "in_progress" ? (
          <div className="flex w-full gap-2">
            <Button asChild className="flex-1">
              <Link href={`/dashboard/quests/${quest.id}`}>
                Continue <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="flex-1" disabled={abandoning}>
                  {abandoning ? "Abandoning..." : "Abandon"}
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
                  <AlertDialogAction onClick={() => onAbandon?.(userQuest.id)} className="bg-red-600 hover:bg-red-700">
                    Abandon Quest
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ) : (
          <Button asChild className="w-full" variant={userQuest.status === "abandoned" ? "outline" : "default"}>
            <Link href={`/dashboard/quests/${quest.id}`}>
              View Details <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
