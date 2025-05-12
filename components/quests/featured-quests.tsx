"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Calendar, Award, ChevronRight, Star } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedQuests, joinQuest } from "@/app/actions/quest-actions"
import type { Quest } from "@/types/quests"
import { toast } from "@/components/ui/use-toast"

export function FeaturedQuests({ userQuestIds = [], limit = 3 }: { userQuestIds?: string[]; limit?: number }) {
  const [quests, setQuests] = useState<Quest[]>([])
  const [loading, setLoading] = useState(true)
  const [joining, setJoining] = useState<string | null>(null)

  useEffect(() => {
    async function loadQuests() {
      setLoading(true)
      const { data, error } = await getFeaturedQuests(limit)
      if (error) {
        toast({
          title: "Error loading featured quests",
          description: error,
          variant: "destructive",
        })
      } else if (data) {
        setQuests(data)
      }
      setLoading(false)
    }

    loadQuests()
  }, [limit])

  const handleJoinQuest = async (questId: string) => {
    setJoining(questId)
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
    setJoining(null)
  }

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array(limit)
          .fill(0)
          .map((_, i) => (
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

  if (quests.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No featured quests</h3>
        <p className="text-muted-foreground">Check back later for exciting featured quests!</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/quests">Browse All Quests</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {quests.map((quest) => (
        <FeaturedQuestCard
          key={quest.id}
          quest={quest}
          onJoin={handleJoinQuest}
          joining={joining === quest.id}
          joined={userQuestIds.includes(quest.id)}
        />
      ))}
    </div>
  )
}

function FeaturedQuestCard({
  quest,
  onJoin,
  joining = false,
  joined = false,
}: {
  quest: Quest
  onJoin?: (id: string) => void
  joining?: boolean
  joined?: boolean
}) {
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

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <div className="absolute right-2 top-2">
        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
          <Star className="mr-1 h-3 w-3 fill-yellow-500 text-yellow-500" /> Featured
        </Badge>
      </div>
      <CardHeader className="pb-2 pt-10">
        <CardTitle className="line-clamp-1">{quest.title}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          <span>Started {formatDate(quest.start_date)}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{quest.description}</p>
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
        {joined ? (
          <Button asChild className="w-full">
            <Link href={`/dashboard/quests/${quest.id}`}>
              Continue Quest <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        ) : (
          <div className="flex w-full gap-2">
            <Button variant="outline" className="flex-1" asChild>
              <Link href={`/dashboard/quests/${quest.id}`}>Details</Link>
            </Button>
            <Button className="flex-1" onClick={() => onJoin?.(quest.id)} disabled={joining}>
              {joining ? "Joining..." : "Join Quest"}
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
