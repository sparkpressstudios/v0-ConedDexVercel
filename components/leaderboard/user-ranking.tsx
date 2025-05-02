"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getUserRanking } from "@/app/actions/leaderboard-actions"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Star, IceCream, Store, Award, MessageSquare } from "lucide-react"

interface UserRankingProps {
  userId: string | undefined
}

type RankingData = {
  [key: string]: {
    rank: number | null
    total_users: number
    percentile: number | null
    score: number
    metric_name: string
  }
}

export function UserRanking({ userId }: UserRankingProps) {
  const [rankings, setRankings] = useState<RankingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRankings() {
      if (!userId) return

      setLoading(true)
      setError(null)

      try {
        const result = await getUserRanking(userId)

        if (result.error) {
          setError(result.error)
        } else if (result.data) {
          setRankings(result.data)
        }
      } catch (err) {
        setError("Failed to load rankings")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [userId])

  if (!userId) {
    return null
  }

  const getIconForMetric = (metricName: string) => {
    switch (metricName) {
      case "flavors_logged":
        return <IceCream className="h-5 w-5" />
      case "shops_visited":
        return <Store className="h-5 w-5" />
      case "average_rating":
        return <Star className="h-5 w-5" />
      case "badges_earned":
        return <Award className="h-5 w-5" />
      case "reviews_written":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Trophy className="h-5 w-5" />
    }
  }

  const getPercentileText = (percentile: number | null) => {
    if (percentile === null) return "N/A"
    if (percentile <= 1) return "Top 1%"
    if (percentile <= 5) return "Top 5%"
    if (percentile <= 10) return "Top 10%"
    if (percentile <= 25) return "Top 25%"
    if (percentile <= 50) return "Top 50%"
    return `Bottom ${Math.round(100 - percentile)}%`
  }

  const getRankColor = (percentile: number | null) => {
    if (percentile === null) return "text-muted-foreground"
    if (percentile <= 1) return "text-yellow-500"
    if (percentile <= 5) return "text-amber-500"
    if (percentile <= 10) return "text-orange-500"
    if (percentile <= 25) return "text-emerald-500"
    if (percentile <= 50) return "text-blue-500"
    return "text-muted-foreground"
  }

  return (
    <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Leaderboard Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error && <p className="text-center text-red-500 mb-4">{error}</p>}

        {loading ? (
          <div className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-lg bg-muted p-4">
                <Skeleton className="h-5 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-4 w-20 mt-2" />
              </div>
            ))}
          </div>
        ) : !rankings || Object.keys(rankings).length === 0 ? (
          <div className="text-center py-6">
            <p className="text-muted-foreground">No rankings available yet</p>
            <p className="text-sm mt-2">
              Start logging flavors, visiting shops, and earning badges to climb the leaderboard!
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(rankings).map(([metricId, data]) => (
              <div key={metricId} className="rounded-lg bg-muted p-4">
                <div className="flex items-center gap-2 mb-2">
                  {getIconForMetric(data.metric_name)}
                  <span className="text-sm font-medium">{data.metric_name.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold">#{data.rank || "N/A"}</span>
                  <span className="text-xs text-muted-foreground">/ {data.total_users}</span>
                </div>
                <p className={`text-sm mt-1 ${getRankColor(data.percentile)}`}>{getPercentileText(data.percentile)}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 text-center">
          <a
            href="/dashboard/leaderboard"
            className="text-sm text-primary hover:underline inline-flex items-center gap-1"
          >
            View full leaderboard
            <Trophy className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  )
}
