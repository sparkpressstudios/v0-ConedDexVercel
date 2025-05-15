"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Trophy, Medal, Award, Star, TrendingUp, Users } from "lucide-react"
import { getTopUsers, getUserRank, getUserNeighbors } from "@/lib/utils/leaderboard-utils"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

interface LeaderboardUser {
  position: number
  value: number
  user_id: string
  profiles: {
    username: string
    avatar_url: string | null
    full_name: string | null
  }
  isCurrentUser?: boolean
}

export function UserLeaderboard() {
  const [activeMetric, setActiveMetric] = useState<string>("flavors_logged")
  const [topUsers, setTopUsers] = useState<LeaderboardUser[]>([])
  const [userRank, setUserRank] = useState<number | null>(null)
  const [userNeighbors, setUserNeighbors] = useState<{ above: LeaderboardUser[]; below: LeaderboardUser[] }>({
    above: [],
    below: [],
  })
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

  // Load leaderboard data
  useEffect(() => {
    const loadLeaderboardData = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      setLoading(true)
      try {
        // Get top users for the selected metric
        const top = await getTopUsers(activeMetric, 10)

        // Get the current user's rank
        const rank = await getUserRank(user.id, activeMetric)
        setUserRank(rank)

        // Get users above and below the current user
        if (rank) {
          const neighbors = await getUserNeighbors(user.id, activeMetric, 2)
          setUserNeighbors(neighbors)
        }

        // Mark the current user in the top users list
        const topWithCurrentUser = top.map((u) => ({
          ...u,
          isCurrentUser: u.user_id === user.id,
        }))

        setTopUsers(topWithCurrentUser)
      } catch (error) {
        console.error("Error loading leaderboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadLeaderboardData()
  }, [activeMetric, user])

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
          <TrendingUp className="mr-2 h-5 w-5 text-primary" />
          Leaderboard
        </CardTitle>
        <CardDescription>See how you rank against other ice cream explorers</CardDescription>
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
              {/* User's rank */}
              {user && (
                <div className="rounded-lg bg-muted p-4">
                  <div className="mb-2 text-sm font-medium">Your Ranking</div>
                  {loading ? (
                    <div className="flex items-center space-x-4">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ) : userRank ? (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar className="h-10 w-10 border-2 border-primary/10">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                            alt={user.email || ""}
                          />
                          <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.email?.split("@")[0] || "You"}</div>
                          <div className="text-sm text-muted-foreground">
                            {getMetricLabel(activeMetric, topUsers.find((u) => u.user_id === user.id)?.value || 0)}
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1.5">
                        <Trophy className="h-3.5 w-3.5" />
                        Rank #{userRank}
                      </Badge>
                    </div>
                  ) : (
                    <div className="text-center py-2 text-sm text-muted-foreground">
                      You haven't ranked for this metric yet. Start exploring to join the leaderboard!
                    </div>
                  )}
                </div>
              )}

              {/* Top users */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Top Explorers</h4>
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {loading ? "..." : topUsers.length}
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
                  // Leaderboard list
                  <div className="space-y-2">
                    {topUsers.map((entry) => (
                      <div
                        key={entry.user_id}
                        className={`flex items-center space-x-4 rounded-md border p-3 ${
                          entry.isCurrentUser ? "bg-primary/5 border-primary/20" : ""
                        }`}
                      >
                        <div className="flex h-8 w-8 items-center justify-center">
                          {getPositionIcon(entry.position)}
                        </div>
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={entry.profiles.avatar_url || "/placeholder.svg"}
                            alt={entry.profiles.username}
                          />
                          <AvatarFallback>
                            {entry.profiles.username?.substring(0, 2).toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {entry.profiles.full_name || entry.profiles.username}
                            {entry.isCurrentUser && <span className="ml-2 text-xs text-muted-foreground">(You)</span>}
                          </p>
                          <p className="text-xs text-muted-foreground">{getMetricLabel(activeMetric, entry.value)}</p>
                        </div>
                        <Badge variant="outline">#{entry.position}</Badge>
                      </div>
                    ))}

                    {topUsers.length === 0 && (
                      <div className="text-center py-8 text-sm text-muted-foreground">
                        No data available for this leaderboard yet.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Users near current user (if not in top) */}
              {user &&
                userRank &&
                userRank > 10 &&
                (userNeighbors.above.length > 0 || userNeighbors.below.length > 0) && (
                  <div className="space-y-2 mt-4">
                    <h4 className="text-sm font-medium">Users Near You</h4>
                    <div className="space-y-2">
                      {userNeighbors.above.map((entry) => (
                        <div key={entry.user_id} className="flex items-center space-x-4 rounded-md border p-3">
                          <div className="flex h-8 w-8 items-center justify-center">
                            {getPositionIcon(entry.position)}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry.profiles.avatar_url || "/placeholder.svg"}
                              alt={entry.profiles.username}
                            />
                            <AvatarFallback>
                              {entry.profiles.username?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">
                              {entry.profiles.full_name || entry.profiles.username}
                            </p>
                            <p className="text-xs text-muted-foreground">{getMetricLabel(activeMetric, entry.value)}</p>
                          </div>
                          <Badge variant="outline">#{entry.position}</Badge>
                        </div>
                      ))}

                      {/* Current user */}
                      <div className="flex items-center space-x-4 rounded-md border p-3 bg-primary/5 border-primary/20">
                        <div className="flex h-8 w-8 items-center justify-center">{getPositionIcon(userRank)}</div>
                        <Avatar className="h-8 w-8 border-2 border-primary/10">
                          <AvatarImage
                            src={user.user_metadata?.avatar_url || "/placeholder.svg"}
                            alt={user.email || ""}
                          />
                          <AvatarFallback>{user.email?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="truncate font-medium">
                            {user.user_metadata?.full_name || user.email?.split("@")[0]}
                            <span className="ml-2 text-xs text-muted-foreground">(You)</span>
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {getMetricLabel(activeMetric, topUsers.find((u) => u.user_id === user.id)?.value || 0)}
                          </p>
                        </div>
                        <Badge variant="outline">#{userRank}</Badge>
                      </div>

                      {userNeighbors.below.map((entry) => (
                        <div key={entry.user_id} className="flex items-center space-x-4 rounded-md border p-3">
                          <div className="flex h-8 w-8 items-center justify-center">
                            {getPositionIcon(entry.position)}
                          </div>
                          <Avatar className="h-8 w-8">
                            <AvatarImage
                              src={entry.profiles.avatar_url || "/placeholder.svg"}
                              alt={entry.profiles.username}
                            />
                            <AvatarFallback>
                              {entry.profiles.username?.substring(0, 2).toUpperCase() || "U"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="truncate font-medium">
                              {entry.profiles.full_name || entry.profiles.username}
                            </p>
                            <p className="text-xs text-muted-foreground">{getMetricLabel(activeMetric, entry.value)}</p>
                          </div>
                          <Badge variant="outline">#{entry.position}</Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
