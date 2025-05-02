"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trophy, Medal, Award } from "lucide-react"
import { getTeamRanking } from "@/app/actions/leaderboard-actions"
import { Skeleton } from "@/components/ui/skeleton"

interface TeamRankingProps {
  teamId: string
}

type RankingData = {
  rank: number
  total_teams: number
  percentile: number
  score: number
  metric_name: string
}

export function TeamRanking({ teamId }: TeamRankingProps) {
  const [rankings, setRankings] = useState<Record<string, RankingData>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadRankings() {
      setLoading(true)
      setError(null)

      try {
        const { data, error } = await getTeamRanking(teamId)

        if (error) {
          setError(error)
        } else if (data) {
          setRankings(data)
        }
      } catch (err) {
        setError("Failed to load rankings")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    loadRankings()
  }, [teamId])

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-5 w-5 text-yellow-500" />
    if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />
    if (rank === 3) return <Medal className="h-5 w-5 text-amber-700" />
    return <Award className="h-5 w-5 text-primary" />
  }

  const getPercentileText = (percentile: number) => {
    if (percentile <= 1) return "Top 1% of teams"
    if (percentile <= 5) return "Top 5% of teams"
    if (percentile <= 10) return "Top 10% of teams"
    if (percentile <= 25) return "Top 25% of teams"
    if (percentile <= 50) return "Top 50% of teams"
    return `Top ${Math.ceil(percentile)}% of teams`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Team Rankings
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : loading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-4 w-[120px]" />
                <Skeleton className="h-6 w-[80px]" />
              </div>
            ))}
          </div>
        ) : Object.keys(rankings).length === 0 ? (
          <p className="text-center text-muted-foreground">No team rankings available yet</p>
        ) : (
          <div className="space-y-4">
            {Object.entries(rankings).map(([metricId, data]) => (
              <div key={metricId} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getRankIcon(data.rank)}
                  <div>
                    <p className="font-medium">{data.metric_name.replace("_", " ")}</p>
                    <p className="text-xs text-muted-foreground">{getPercentileText(data.percentile)}</p>
                  </div>
                </div>
                <Badge variant={data.rank <= 3 ? "default" : "secondary"} className="text-sm">
                  Rank #{data.rank}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
