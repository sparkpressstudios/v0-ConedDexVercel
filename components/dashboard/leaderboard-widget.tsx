"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type LeaderboardEntry = {
  user_id: string
  username: string
  avatar_url?: string
  score: number
  rank: number
}

export function LeaderboardWidget() {
  const [userLeaderboard, setUserLeaderboard] = useState<LeaderboardEntry[]>([])
  const [teamLeaderboard, setTeamLeaderboard] = useState<{ id: string; name: string; score: number; rank: number }[]>(
    [],
  )
  const [userRank, setUserRank] = useState<LeaderboardEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("users")
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadLeaderboardData() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        // Get current season
        const { data: currentSeason, error: seasonError } = await supabase
          .from("leaderboard_seasons")
          .select("id")
          .eq("is_active", true)
          .single()

        if (seasonError) {
          throw new Error(seasonError.message)
        }

        const seasonId = currentSeason?.id

        if (!seasonId) {
          throw new Error("No active leaderboard season found")
        }

        // Get user leaderboard
        const { data: users, error: usersError } = await supabase
          .from("leaderboard_rankings")
          .select(`
            user_id,
            score,
            rank,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("season_id", seasonId)
          .eq("metric_id", "total_points") // Assuming 'total_points' is the default metric
          .order("rank", { ascending: true })
          .limit(5)

        if (usersError) {
          throw new Error(usersError.message)
        }

        // Get team leaderboard
        const { data: teams, error: teamsError } = await supabase
          .from("team_leaderboard_rankings")
          .select(`
            team_id,
            score,
            rank,
            teams:team_id (
              id,
              name
            )
          `)
          .eq("season_id", seasonId)
          .eq("metric_id", "total_points")
          .order("rank", { ascending: true })
          .limit(5)

        if (teamsError) {
          throw new Error(teamsError.message)
        }

        // Get current user's rank
        const { data: currentUserRank, error: currentUserError } = await supabase
          .from("leaderboard_rankings")
          .select(`
            user_id,
            score,
            rank,
            profiles:user_id (
              username,
              avatar_url
            )
          `)
          .eq("season_id", seasonId)
          .eq("metric_id", "total_points")
          .eq("user_id", user.id)
          .single()

        if (currentUserError && currentUserError.code !== "PGRST116") {
          // PGRST116 is "no rows returned" which is fine
          throw new Error(currentUserError.message)
        }

        // Format user leaderboard data
        const formattedUsers =
          users?.map((entry) => ({
            user_id: entry.user_id,
            username: (entry.profiles as any)?.username || "Anonymous",
            avatar_url: (entry.profiles as any)?.avatar_url,
            score: entry.score,
            rank: entry.rank,
          })) || []

        // Format team leaderboard data
        const formattedTeams =
          teams?.map((entry) => ({
            id: entry.team_id,
            name: (entry.teams as any)?.name || "Unknown Team",
            score: entry.score,
            rank: entry.rank,
          })) || []

        // Format current user's rank
        const formattedUserRank = currentUserRank
          ? {
              user_id: currentUserRank.user_id,
              username: (currentUserRank.profiles as any)?.username || "Anonymous",
              avatar_url: (currentUserRank.profiles as any)?.avatar_url,
              score: currentUserRank.score,
              rank: currentUserRank.rank,
            }
          : null

        setUserLeaderboard(formattedUsers)
        setTeamLeaderboard(formattedTeams)
        setUserRank(formattedUserRank)
      } catch (err) {
        console.error("Error loading leaderboard data:", err)
        setError(err instanceof Error ? err.message : "Failed to load leaderboard data")
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboardData()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaderboard</CardTitle>
        <CardDescription>Top ConeDex explorers this season</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : userLeaderboard.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No leaderboard data available yet.</p>
                <p className="mt-2">Start exploring to climb the ranks!</p>
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {userLeaderboard.map((entry) => (
                    <div key={entry.user_id} className="flex items-center space-x-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                        {entry.rank}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {entry.avatar_url ? (
                          <img
                            src={entry.avatar_url || "/placeholder.svg"}
                            alt={entry.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary">{entry.username.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.username}</p>
                        <p className="text-xs text-muted-foreground">{entry.score} points</p>
                      </div>
                      {entry.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                    </div>
                  ))}
                </div>

                {userRank && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground mb-2">Your Ranking</p>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-xs font-medium">
                        {userRank.rank}
                      </div>
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        {userRank.avatar_url ? (
                          <img
                            src={userRank.avatar_url || "/placeholder.svg"}
                            alt={userRank.username}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-lg font-bold text-primary">{userRank.username.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">You</p>
                        <p className="text-xs text-muted-foreground">{userRank.score} points</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            <div className="flex justify-center mt-4">
              <Link href="/dashboard/leaderboard">
                <Button variant="outline" size="sm">
                  View Full Leaderboard
                </Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                    <Skeleton className="h-6 w-12" />
                  </div>
                ))}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : teamLeaderboard.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <p>No team leaderboard data available yet.</p>
                <p className="mt-2">Join or create a team to compete!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {teamLeaderboard.map((team) => (
                  <div key={team.id} className="flex items-center space-x-3">
                    <div className="flex items-center justify-center h-6 w-6 rounded-full bg-muted text-xs font-medium">
                      {team.rank}
                    </div>
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-lg font-bold text-primary">{team.name.charAt(0)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{team.name}</p>
                      <p className="text-xs text-muted-foreground">{team.score} points</p>
                    </div>
                    {team.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-center mt-4">
              <Link href="/dashboard/teams">
                <Button variant="outline" size="sm">
                  View All Teams
                </Button>
              </Link>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
