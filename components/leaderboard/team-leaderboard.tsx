"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Users } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface Team {
  id: string
  name: string
  logo_url: string | null
  member_count: number
  position: number
  value: number
  isUserTeam?: boolean
}

export function TeamLeaderboard() {
  const [activeMetric, setActiveMetric] = useState<string>("flavors_logged")
  const [teams, setTeams] = useState<Team[]>([])
  const [userTeam, setUserTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  // Metric options
  const metrics = [
    { id: "flavors_logged", name: "Flavors Logged", icon: <IceCream className="h-4 w-4" /> },
    { id: "shops_visited", name: "Shops Visited", icon: <Store className="h-4 w-4" /> },
    { id: "badges_earned", name: "Badges Earned", icon: <Award className="h-4 w-4" /> },
    { id: "reviews_posted", name: "Reviews Posted", icon: <Star className="h-4 w-4" /> },
  ]

  // Load team leaderboard data
  useEffect(() => {
    const loadTeamLeaderboard = async () => {
      setLoading(true)
      try {
        // Get top teams for the selected metric
        const { data: teamsData, error: teamsError } = await supabase
          .from("team_leaderboard")
          .select("*")
          .eq("metric_id", activeMetric)
          .order("position", { ascending: true })
          .limit(10)

        if (teamsError) throw teamsError

        // If user is logged in, get their team
        let userTeamData = null
        if (user) {
          const { data: userTeamMembership, error: membershipError } = await supabase
            .from("team_members")
            .select("team_id")
            .eq("user_id", user.id)
            .maybeSingle()

          if (!membershipError && userTeamMembership) {
            const { data: teamData, error: teamError } = await supabase
              .from("team_leaderboard")
              .select("*")
              .eq("team_id", userTeamMembership.team_id)
              .eq("metric_id", activeMetric)
              .maybeSingle()

            if (!teamError && teamData) {
              userTeamData = teamData
            }
          }
        }

        // Mark the user's team in the list
        const teamsWithUserTeam = teamsData.map((team) => ({
          ...team,
          isUserTeam: userTeamData ? team.id === userTeamData.team_id : false,
        }))

        setTeams(teamsWithUserTeam)
        setUserTeam(userTeamData)
      } catch (error) {
        console.error("Error loading team leaderboard:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTeamLeaderboard()
  }, [activeMetric, user, supabase])

  // Get the icon for a position
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />
      case 3:
        return <Medal className="h-5 w-5 text-amber-600" />
      default:
        return (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-xs">{position}</span>
        )
    }
  }

  // Get the label for a metric value
  const getMetricLabel = (metric: string, value: number) => {
    switch (metric) {
      case "flavors_logged":
        return `${value} flavor${value !== 1 ? "s" : ""}`
      case "shops_visited":
        return `${value} shop${value !== 1 ? "s" : ""}`
      case "badges_earned":
        return `${value} badge${value !== 1 ? "s" : ""}`
      case "reviews_posted":
        return `${value} review${value !== 1 ? "s" : ""}`
      default:
        return value
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5 text-primary" />
          Team Leaderboard
        </CardTitle>
        <CardDescription>See how your team ranks against others</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={activeMetric} onValueChange={setActiveMetric} className="space-y-4">
          <TabsList className="grid grid-cols-2 md:grid-cols-4">
            {metrics.map((metric) => (
              <TabsTrigger key={metric.id} value={metric.id} className="flex items-center">
                <span className="mr-1.5">{metric.icon}</span>
                <span className="hidden md:inline">{metric.name}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {metrics.map((metric) => (
            <TabsContent key={metric.id} value={metric.id} className="space-y-4">
              {/* User's team */}
              {user && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 text-sm font-medium">Your Team</div>
                  {loading ? (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ) : userTeam ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          {userTeam.logo_url ? (
                            <img
                              src={userTeam.logo_url || "/placeholder.svg"}
                              alt={userTeam.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">{userTeam.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {getMetricLabel(activeMetric, userTeam.value)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" />
                        Rank #{userTeam.position}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      You're not part of a team yet. Join or create a team to compete!
                    </div>
                  )}
                </div>
              )}

              {/* Top teams */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Top Teams</h4>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {loading ? "..." : teams.length}
                  </Badge>
                </div>

                {loading ? (
                  // Loading skeletons
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div key={i} className="flex items-center space-x-4 rounded-md border p-3">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-[200px]" />
                          <Skeleton className="h-3 w-[150px]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Team leaderboard list
                  <div className="space-y-2">
                    {teams.map((team) => (
                      <div
                        key={team.id}
                        className={`flex items-center space-x-4 rounded-md border p-3 ${
                          team.isUserTeam ? "bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center">{getPositionIcon(team.position)}</div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                          {team.logo_url ? (
                            <img
                              src={team.logo_url || "/placeholder.svg"}
                              alt={team.name}
                              className="h-full w-full rounded-full object-cover"
                            />
                          ) : (
                            <Users className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {team.name}
                            {team.isUserTeam && <span className="ml-2 text-xs text-muted-foreground">(Your Team)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getMetricLabel(activeMetric, team.value)} • {team.member_count} member
                            {team.member_count !== 1 ? "s" : ""}
                          </p>
                        </div>
                        <Badge variant="outline">#{team.position}</Badge>
                      </div>
                    ))}

                    {teams.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No teams have ranked for this metric yet. Be the first!
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}

// Import the icons
function IceCream(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6Zm-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0M12.14 11a3.5 3.5 0 1 1 6.71 0M15.5 6.5a3.5 3.5 0 1 0-7 0" />
    </svg>
  )
}

function Store(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7" />
    </svg>
  )
}

function Award(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  )
}

function Star(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
