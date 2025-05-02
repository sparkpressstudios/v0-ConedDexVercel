"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UserLeaderboard } from "@/components/leaderboard/user-leaderboard"
import { TeamLeaderboard } from "@/components/leaderboard/team-leaderboard"
import { MetricSelector } from "@/components/leaderboard/metric-selector"
import { SeasonSelector } from "@/components/leaderboard/season-selector"
import { Trophy } from "lucide-react"

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"users" | "teams">("users")
  const [selectedMetric, setSelectedMetric] = useState<string>("flavors_logged")
  const [selectedSeason, setSelectedSeason] = useState<string>("all_time")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">See who's leading the ice cream adventure</p>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="h-6 w-6 text-yellow-500" />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <MetricSelector selectedMetric={selectedMetric} onSelectMetric={setSelectedMetric} />
        <SeasonSelector selectedSeason={selectedSeason} onSelectSeason={setSelectedSeason} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top Rankings</CardTitle>
          <CardDescription>
            {selectedSeason === "all_time" ? "All-time" : "Seasonal"} rankings for{" "}
            {selectedMetric === "flavors_logged"
              ? "most flavors logged"
              : selectedMetric === "shops_visited"
                ? "most shops visited"
                : selectedMetric === "avg_rating"
                  ? "highest average ratings"
                  : "most badges earned"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "users" | "teams")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">Users</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>
            <TabsContent value="users" className="mt-4">
              <UserLeaderboard metric={selectedMetric} season={selectedSeason} />
            </TabsContent>
            <TabsContent value="teams" className="mt-4">
              <TeamLeaderboard metric={selectedMetric} season={selectedSeason} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
