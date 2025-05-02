"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getUserLeaderboard, getSeasonalUserLeaderboard } from "@/app/actions/leaderboard-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { UserRankBadge } from "@/components/leaderboard/user-rank-badge"

interface UserLeaderboardProps {
  metricId: string | null
  seasonId?: string | null
  initialData?: any[]
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
  leaderboard_seasons?: {
    name: string
    description: string
    start_date: string
    end_date: string
  }
}

export function UserLeaderboard({ metricId, seasonId, initialData = [] }: UserLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  useEffect(() => {
    async function loadLeaderboard() {
      if (!metricId) return

      setLoading(true)
      setError(null)
      setPage(1)
      setEntries([])
      setHasMore(true)

      try {
        let result
        const offset = (page - 1) * limit
        if (seasonId) {
          result = await getSeasonalUserLeaderboard(seasonId, metricId, limit, offset)
        } else {
          result = await getUserLeaderboard(metricId, limit, offset)
        }

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setEntries(result.data)
          setHasMore(result.data.length === limit)
        }
      } catch (err) {
        setError("Failed to load leaderboard")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboard()
  }, [metricId, seasonId, limit, page])

  async function loadMore() {
    if (!metricId || loading) return

    const nextPage = page + 1
    const offset = (nextPage - 1) * limit

    setLoading(true)

    try {
      let result
      if (seasonId) {
        result = await getSeasonalUserLeaderboard(seasonId, metricId, limit, offset)
      } else {
        result = await getUserLeaderboard(metricId, limit, offset)
      }

      if (result.error) {
        setError(result.error)
      } else if (result.data) {
        setEntries([...entries, ...result.data])
        setHasMore(result.data.length === limit)
        setPage(nextPage)
      }
    } catch (err) {
      setError("Failed to load more entries")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!metricId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Select a metric to view the leaderboard</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {seasonId && entries.length > 0 && entries[0].leaderboard_seasons
            ? `${entries[0].leaderboard_seasons.name} - `
            : ""}
          User Leaderboard
          {entries.length > 0 && entries[0].leaderboard_metrics && (
            <span className="ml-2 text-muted-foreground font-normal">
              ({entries[0].leaderboard_metrics.name.replace(/_/g, " ")})
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          {loading && entries.length === 0 ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[150px]" />
                </div>
              </div>
            ))
          ) : entries.length === 0 ? (
            <p className="text-center text-muted-foreground">No entries found</p>
          ) : (
            <>
              {entries.map((entry, index) => (
                <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-4">
                    <UserRankBadge rank={(page - 1) * limit + index + 1} />
                    <Avatar>
                      <AvatarImage src={entry.profiles.avatar_url || undefined} />
                      <AvatarFallback>
                        {getInitials(entry.profiles.full_name || entry.profiles.username || "User")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {entry.profiles.full_name || entry.profiles.username || "Anonymous User"}
                      </p>
                      {entry.profiles.username && entry.profiles.full_name && (
                        <p className="text-sm text-muted-foreground">@{entry.profiles.username}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {entry.score.toLocaleString()}
                  </Badge>
                </div>
              ))}

              <div className="flex justify-between items-center pt-4">
                <Button
                  variant="outline"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page === 1}
                  className="flex items-center"
                >
                  <ChevronLeft className="mr-1 h-4 w-4" /> Previous
                </Button>
                <span className="text-sm text-gray-500">Page {page}</span>
                <Button variant="outline" onClick={loadMore} disabled={!hasMore} className="flex items-center">
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
