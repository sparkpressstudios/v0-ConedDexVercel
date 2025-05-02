"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { getTeamLeaderboard } from "@/app/actions/leaderboard-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { ChevronDown, Users } from "lucide-react"
import { UserRankBadge } from "@/components/leaderboard/user-rank-badge"

interface TeamLeaderboardProps {
  metricId: string | null
}

type LeaderboardEntry = {
  id: string
  score: number
  teams: {
    id: string
    name: string
    description: string | null
    logo_url: string | null
  }
  leaderboard_metrics: {
    name: string
    description: string
    icon: string
  }
}

export function TeamLeaderboard({ metricId }: TeamLeaderboardProps) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 10

  useEffect(() => {
    async function loadLeaderboard() {
      if (!metricId) return

      setLoading(true)
      setError(null)
      setPage(0)
      setEntries([])

      try {
        const result = await getTeamLeaderboard(metricId, limit, 0)

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
  }, [metricId, limit])

  async function loadMore() {
    if (!metricId || loading) return

    const nextPage = page + 1
    const offset = nextPage * limit

    setLoading(true)

    try {
      const result = await getTeamLeaderboard(metricId, limit, offset)

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

  if (!metricId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Leaderboard</CardTitle>
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
          Team Leaderboard
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
                    <UserRankBadge rank={index + 1 + page * limit} />
                    <Avatar>
                      <AvatarImage src={entry.teams.logo_url || undefined} />
                      <AvatarFallback>
                        <Users className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{entry.teams.name}</p>
                      {entry.teams.description && (
                        <p className="text-sm text-muted-foreground">{entry.teams.description}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-lg px-3 py-1">
                    {entry.score.toLocaleString()}
                  </Badge>
                </div>
              ))}

              {hasMore && (
                <div className="flex justify-center mt-4">
                  <Button variant="outline" onClick={loadMore} disabled={loading} className="w-full">
                    {loading ? "Loading..." : "Load More"}
                    {!loading && <ChevronDown className="ml-2 h-4 w-4" />}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
