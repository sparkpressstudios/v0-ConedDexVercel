"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserLeaderboard } from "@/components/leaderboard/user-leaderboard"
import { TeamLeaderboard } from "@/components/leaderboard/team-leaderboard"
import { MetricSelector } from "@/components/leaderboard/metric-selector"
import { SeasonSelector } from "@/components/leaderboard/season-selector"
import { getLeaderboardMetrics, getLeaderboardSeasons, getCurrentSeason } from "@/app/actions/leaderboard-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export function LeaderboardTabs() {
  const [activeTab, setActiveTab] = useState("users")
  const [selectedMetric, setSelectedMetric] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<Array<{ id: string; name: string; description: string; icon: string }>>([])
  const [seasons, setSeasons] = useState<
    Array<{ id: string; name: string; description: string; start_date: string; end_date: string; is_active: boolean }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load metrics
        const metricsResult = await getLeaderboardMetrics()
        if (metricsResult.data) {
          setMetrics(metricsResult.data)
          if (metricsResult.data.length > 0) {
            setSelectedMetric(metricsResult.data[0].id)
          }
        }

        // Load seasons
        const seasonsResult = await getLeaderboardSeasons()
        if (seasonsResult.data) {
          setSeasons(seasonsResult.data)
        }

        // Get current season
        const currentSeasonResult = await getCurrentSeason()
        if (currentSeasonResult.data) {
          setSelectedSeason(currentSeasonResult.data.id)
        }
      } catch (error) {
        console.error("Error loading leaderboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <Skeleton className="h-6 w-40" />
          </CardTitle>
          <CardDescription>
            <Skeleton className="h-4 w-60" />
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-4 w-[150px]" />
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
        </TabsList>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <MetricSelector metrics={metrics} selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
          {activeTab === "seasonal" && (
            <SeasonSelector seasons={seasons} selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} />
          )}
        </div>
      </div>

      <TabsContent value="users">
        <UserLeaderboard metricId={selectedMetric} />
      </TabsContent>
      <TabsContent value="teams">
        <TeamLeaderboard metricId={selectedMetric} />
      </TabsContent>
      <TabsContent value="seasonal">
        <UserLeaderboard metricId={selectedMetric} seasonId={selectedSeason} />
      </TabsContent>
    </Tabs>
  )
}
