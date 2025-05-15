"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Calendar, CheckCircle2, Clock, Trophy } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// Demo data for badges
const DEMO_BADGES = [
  {
    id: "1",
    name: "Ice Cream Explorer",
    description: "Logged your first 10 flavors",
    image_url: "/generic-badge.png",
    date_earned: "2023-05-20",
    category: "collection",
  },
  {
    id: "2",
    name: "Shop Hopper",
    description: "Visited 5 different ice cream shops",
    image_url: "/generic-badge.png",
    date_earned: "2023-06-05",
    category: "exploration",
  },
  {
    id: "3",
    name: "Flavor Connoisseur",
    description: "Logged 5 different flavor categories",
    image_url: "/generic-badge.png",
    date_earned: "2023-06-15",
    category: "expertise",
  },
  {
    id: "4",
    name: "Social Scooper",
    description: "Shared 3 flavors on social media",
    image_url: "/generic-badge.png",
    date_earned: "2023-07-01",
    category: "social",
  },
  {
    id: "5",
    name: "Review Master",
    description: "Wrote 10 detailed flavor reviews",
    image_url: "/generic-badge.png",
    date_earned: "2023-07-10",
    category: "contribution",
  },
]

// Demo data for quests
const DEMO_QUESTS = [
  {
    id: "1",
    name: "Summer Flavor Hunter",
    description: "Log 5 fruit-based flavors during summer",
    progress: 3,
    total: 5,
    deadline: "2023-08-31",
    reward: "Summer Flavor Hunter Badge",
    status: "in-progress",
  },
  {
    id: "2",
    name: "Local Explorer",
    description: "Visit 3 local ice cream shops in your city",
    progress: 2,
    total: 3,
    deadline: "2023-09-15",
    reward: "Local Explorer Badge",
    status: "in-progress",
  },
  {
    id: "3",
    name: "Chocolate Aficionado",
    description: "Try and log 8 different chocolate-based flavors",
    progress: 8,
    total: 8,
    deadline: "2023-10-31",
    reward: "Chocolate Aficionado Badge + Profile Flair",
    status: "completed",
  },
]

interface UserAchievementsProps {
  userId?: string
  isDemoUser?: boolean
}

export default function UserAchievements({ userId, isDemoUser = false }: UserAchievementsProps) {
  const [badges, setBadges] = useState([])
  const [quests, setQuests] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchAchievements() {
      if (isDemoUser) {
        setBadges(DEMO_BADGES)
        setQuests(DEMO_QUESTS)
        setLoading(false)
        return
      }

      try {
        // Use the userId from props if available, otherwise use the authenticated user's ID
        const id = userId || user?.id

        if (!id) {
          console.error("No user ID available to fetch achievements")
          setLoading(false)
          return
        }

        // Fetch badges
        const { data: badgesData, error: badgesError } = await supabase
          .from("user_badges")
          .select(
            `
            date_earned,
            badges (
              id,
              name,
              description,
              image_url,
              category
            )
          `,
          )
          .eq("user_id", id)
          .order("date_earned", { ascending: false })

        if (badgesError) {
          throw badgesError
        }

        // Transform the data to match our expected format
        const formattedBadges = badgesData.map((item) => ({
          id: item.badges?.id || "unknown",
          name: item.badges?.name || "Unknown Badge",
          description: item.badges?.description || "",
          image_url: item.badges?.image_url || "/generic-badge.png",
          date_earned: item.date_earned,
          category: item.badges?.category || "other",
        }))

        setBadges(formattedBadges)

        // Fetch quests
        const { data: questsData, error: questsError } = await supabase
          .from("user_quests")
          .select(
            `
            progress,
            status,
            quests (
              id,
              name,
              description,
              total_steps,
              deadline,
              reward
            )
          `,
          )
          .eq("user_id", id)
          .order("status", { ascending: true })

        if (questsError) {
          throw questsError
        }

        // Transform the data to match our expected format
        const formattedQuests = questsData.map((item) => ({
          id: item.quests?.id || "unknown",
          name: item.quests?.name || "Unknown Quest",
          description: item.quests?.description || "",
          progress: item.progress || 0,
          total: item.quests?.total_steps || 1,
          deadline: item.quests?.deadline,
          reward: item.quests?.reward || "Badge",
          status: item.status || "in-progress",
        }))

        setQuests(formattedQuests)
      } catch (error) {
        console.error("Error fetching achievements:", error)
        // Fallback to demo data on error
        setBadges(DEMO_BADGES)
        setQuests(DEMO_QUESTS)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [userId, isDemoUser, supabase, user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Achievements</CardTitle>
          <CardDescription>Loading your badges and quests...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-48 rounded-md bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="badges">
      <TabsList className="w-full">
        <TabsTrigger value="badges" className="flex-1">
          <Award className="h-4 w-4 mr-2" />
          Badges ({badges.length})
        </TabsTrigger>
        <TabsTrigger value="quests" className="flex-1">
          <Trophy className="h-4 w-4 mr-2" />
          Quests ({quests.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="badges" className="mt-6">
        {badges.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Badges Yet</CardTitle>
              <CardDescription>
                You haven't earned any badges yet. Complete quests and explore more flavors to earn badges!
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Award className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center max-w-md">
                Badges are awarded for achievements like trying new flavors, visiting shops, and completing quests.
              </p>
              <Button className="mt-6" asChild>
                <Link href="/dashboard/quests">Browse Available Quests</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge) => (
                <Card key={badge.id} className="overflow-hidden">
                  <div className="p-4 flex items-center justify-center bg-muted/30">
                    <div className="relative h-24 w-24">
                      <Image
                        src={badge.image_url || "/generic-badge.png"}
                        alt={badge.name}
                        fill
                        className="object-contain"
                        sizes="96px"
                      />
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg">{badge.name}</CardTitle>
                    <Badge variant="outline">{badge.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{badge.description}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      Earned on {new Date(badge.date_earned).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </TabsContent>

      <TabsContent value="quests" className="mt-6">
        {quests.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Quests Available</CardTitle>
              <CardDescription>There are no quests available for you at the moment. Check back later!</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <Trophy className="h-16 w-16 text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground text-center max-w-md">
                Quests are special challenges that reward you with badges and other perks when completed.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {quests.some((quest) => quest.status === "in-progress") && (
              <>
                <h3 className="text-lg font-medium">Active Quests</h3>
                <div className="space-y-4">
                  {quests
                    .filter((quest) => quest.status === "in-progress")
                    .map((quest) => (
                      <Card key={quest.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{quest.name}</CardTitle>
                              <CardDescription>{quest.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                              In Progress
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {quest.progress} / {quest.total}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div
                                  className="bg-primary h-2.5 rounded-full"
                                  style={{ width: `${(quest.progress / quest.total) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Clock className="h-4 w-4 mr-1" />
                                {quest.deadline ? (
                                  <span>Ends {new Date(quest.deadline).toLocaleDateString()}</span>
                                ) : (
                                  <span>No deadline</span>
                                )}
                              </div>
                              <div className="flex items-center">
                                <Award className="h-4 w-4 mr-1 text-amber-500" />
                                <span>{quest.reward}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            )}

            {quests.some((quest) => quest.status === "completed") && (
              <>
                <h3 className="text-lg font-medium mt-6">Completed Quests</h3>
                <div className="space-y-4">
                  {quests
                    .filter((quest) => quest.status === "completed")
                    .map((quest) => (
                      <Card key={quest.id}>
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle>{quest.name}</CardTitle>
                              <CardDescription>{quest.description}</CardDescription>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Completed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Progress</span>
                                <span>
                                  {quest.total} / {quest.total}
                                </span>
                              </div>
                              <div className="w-full bg-muted rounded-full h-2.5">
                                <div className="bg-green-500 h-2.5 rounded-full w-full"></div>
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                              <div className="flex items-center text-muted-foreground">
                                <Calendar className="h-4 w-4 mr-1" />
                                <span>Completed on {new Date().toLocaleDateString()}</span>
                              </div>
                              <div className="flex items-center">
                                <Award className="h-4 w-4 mr-1 text-amber-500" />
                                <span>{quest.reward}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}
