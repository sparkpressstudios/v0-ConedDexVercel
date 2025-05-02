"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { getUserLeaderboard } from "@/app/actions/leaderboard-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { UserRankBadge } from "../leaderboard/user-rank-badge"

interface LeaderboardWidgetProps {
  metricId?: string
  limit?: number
}

type LeaderboardEntry = {
  id: string
  score: number
  profiles: {
    id: string
    username: string
    full_name: string | null
    avatar_url: string | null
  }
  leaderboard_metrics: {
    name: string
    description: string
    icon: string
  }
}

export function LeaderboardWidget({ metricId = "flavors_logged", limit = 5 }: LeaderboardWidgetProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLeaderboard() {
      setLoading(true)
      setError(null)

      try {
        const result = await getUserLeaderboard(metricId, limit, 0)

        if (result.error) {
          setError(result.error)
          console.error("Leaderboard error:", result.error)
        } else if (result.data) {
          setEntries(result.data)
        }
      } catch (err) {
        console.error("Failed to load leaderboard:", err)
        setError("Failed to load leaderboard")
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [metricId, limit])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Ice Cream Explorers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        <div className="space-y-3">
          {loading ? (
            Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-1 flex-1">
                  <Skeleton className="h-4 w-[120px]" />
                  <Skeleton className="h-3 w-[80px]" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))
          ) : error ? (
            <p className="text-center text-red-500 py-4">{error}</p>
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No entries found</p>
          ) : (
            entries.map((entry, index) => (
              <div key={entry.id} className="flex items-center gap-3">
                <UserRankBadge rank={index + 1} className="h-7 w-7 text-sm" />
                <Avatar className="h-8 w-8">
                  <AvatarImage src={entry.profiles.avatar_url || undefined} />
                  <AvatarFallback>
                    {getInitials(entry.profiles.full_name || entry.profiles.username || "User")}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {entry.profiles.full_name || entry.profiles.username || "Anonymous User"}
                  </p>
                  {entry.profiles.username && entry.profiles.full_name && (
                    <p className="text-xs text-muted-foreground truncate">@{entry.profiles.username}</p>
                  )}
                </div>
                <span className="text-sm font-medium">{entry.score.toLocaleString()}</span>
              </div>
            ))
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/leaderboard">View Full Leaderboard</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
