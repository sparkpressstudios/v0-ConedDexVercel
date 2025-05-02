"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { IceCream, Store, Award, TrendingUp, Star, Map, ThumbsUp } from "lucide-react"

interface UserStats {
  totalFlavorsLogged: number
  uniqueShopsVisited: number
  badgesEarned: number
  currentStreak: number
  averageRating: number
  topCategory: string
  mostVisitedShop: string
  mostLoggedFlavor: string
  flavorsByMonth: Record<string, number>
  ratingDistribution: Record<string, number>
}

export default function PersonalStats() {
  const [stats, setStats] = useState<UserStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchUserStats() {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) {
          setLoading(false)
          return
        }

        // Fetch basic stats
        const { data: flavorLogs, error: flavorError } = await supabase
          .from("flavor_logs")
          .select("id, name, rating, shop_id, created_at, category")
          .eq("user_id", user.user.id)

        if (flavorError) throw flavorError

        // Fetch badges
        const { data: badges, error: badgesError } = await supabase
          .from("user_badges")
          .select("id")
          .eq("user_id", user.user.id)

        if (badgesError) throw badgesError

        // Fetch shops
        const { data: shops, error: shopsError } = await supabase.from("shops").select("id, name")

        if (shopsError) throw shopsError

        // Calculate stats
        const shopVisits: Record<string, number> = {}
        const flavorCounts: Record<string, number> = {}
        const ratingDistribution: Record<string, number> = {}
        const flavorsByMonth: Record<string, number> = {}
        let totalRating = 0

        flavorLogs.forEach((log) => {
          // Shop visits
          shopVisits[log.shop_id] = (shopVisits[log.shop_id] || 0) + 1

          // Flavor counts
          flavorCounts[log.name] = (flavorCounts[log.name] || 0) + 1

          // Rating distribution
          const ratingKey = log.rating.toString()
          ratingDistribution[ratingKey] = (ratingDistribution[ratingKey] || 0) + 1
          totalRating += log.rating

          // Flavors by month
          const date = new Date(log.created_at)
          const monthKey = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
          flavorsByMonth[monthKey] = (flavorsByMonth[monthKey] || 0) + 1
        })

        // Find most visited shop
        let mostVisitedShopId = ""
        let mostVisitedCount = 0
        Object.entries(shopVisits).forEach(([shopId, count]) => {
          if (count > mostVisitedCount) {
            mostVisitedShopId = shopId
            mostVisitedCount = count
          }
        })

        // Find most logged flavor
        let mostLoggedFlavor = ""
        let mostLoggedCount = 0
        Object.entries(flavorCounts).forEach(([flavor, count]) => {
          if (count > mostLoggedCount) {
            mostLoggedFlavor = flavor
            mostLoggedCount = count
          }
        })

        // Find top category
        const categories: Record<string, number> = {}
        flavorLogs.forEach((log) => {
          if (log.category) {
            categories[log.category] = (categories[log.category] || 0) + 1
          }
        })

        let topCategory = ""
        let topCategoryCount = 0
        Object.entries(categories).forEach(([category, count]) => {
          if (count > topCategoryCount) {
            topCategory = category
            topCategoryCount = count
          }
        })

        // Calculate streak (simplified)
        const currentStreak = calculateStreak(flavorLogs.map((log) => new Date(log.created_at)))

        // Find shop name
        const mostVisitedShop = shops.find((shop) => shop.id === mostVisitedShopId)?.name || "Unknown"

        setStats({
          totalFlavorsLogged: flavorLogs.length,
          uniqueShopsVisited: Object.keys(shopVisits).length,
          badgesEarned: badges.length,
          currentStreak,
          averageRating: flavorLogs.length > 0 ? totalRating / flavorLogs.length : 0,
          topCategory,
          mostVisitedShop,
          mostLoggedFlavor,
          flavorsByMonth,
          ratingDistribution,
        })
      } catch (error) {
        console.error("Error fetching user stats:", error)
        toast({
          title: "Error",
          description: "Failed to load your statistics",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchUserStats()
  }, [supabase, toast])

  // Helper function to calculate streak
  function calculateStreak(dates: Date[]): number {
    if (dates.length === 0) return 0

    // Sort dates in descending order (newest first)
    const sortedDates = [...dates].sort((a, b) => b.getTime() - a.getTime())

    // Format dates to YYYY-MM-DD for comparison
    const formattedDates = sortedDates.map(
      (date) =>
        `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`,
    )

    // Remove duplicates (only count one log per day)
    const uniqueDates = [...new Set(formattedDates)]

    // Check if most recent log is from today or yesterday
    const today = new Date()
    const todayFormatted = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, "0")}-${today.getDate().toString().padStart(2, "0")}`

    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayFormatted = `${yesterday.getFullYear()}-${(yesterday.getMonth() + 1).toString().padStart(2, "0")}-${yesterday.getDate().toString().padStart(2, "0")}`

    if (uniqueDates[0] !== todayFormatted && uniqueDates[0] !== yesterdayFormatted) {
      return 0 // Streak broken if no logs today or yesterday
    }

    // Count consecutive days
    let streak = 1
    for (let i = 1; i < uniqueDates.length; i++) {
      const currentDate = new Date(uniqueDates[i - 1])
      currentDate.setDate(currentDate.getDate() - 1)
      const expectedPrevious = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, "0")}-${currentDate.getDate().toString().padStart(2, "0")}`

      if (uniqueDates[i] === expectedPrevious) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Personal Statistics</CardTitle>
          <CardDescription>You haven't logged any flavors yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start exploring ice cream shops and logging flavors to see your statistics!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Ice Cream Journey</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <IceCream className="h-4 w-4 mr-2" />
              Flavors Logged
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlavorsLogged}</div>
            <p className="text-xs text-muted-foreground">unique flavors in your collection</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Store className="h-4 w-4 mr-2" />
              Shops Visited
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueShopsVisited}</div>
            <p className="text-xs text-muted-foreground">different ice cream establishments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Badges Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.badgesEarned}</div>
            <p className="text-xs text-muted-foreground">achievements unlocked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Current Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.currentStreak}</div>
            <p className="text-xs text-muted-foreground">consecutive days logging flavors</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="ratings">Ratings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Flavor Profile</CardTitle>
              <CardDescription>Summary of your ice cream preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Star className="h-4 w-4 mr-1" />
                      Average Rating
                    </span>
                    <span className="font-medium">{stats.averageRating.toFixed(1)}/10</span>
                  </div>
                  <Progress value={stats.averageRating * 10} className="h-2" />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <ThumbsUp className="h-4 w-4 mr-1" />
                      Top Category
                    </span>
                    <span className="font-medium">{stats.topCategory || "None"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <Map className="h-4 w-4 mr-1" />
                      Most Visited Shop
                    </span>
                    <span className="font-medium">{stats.mostVisitedShop || "None"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="flex items-center">
                      <IceCream className="h-4 w-4 mr-1" />
                      Most Logged Flavor
                    </span>
                    <span className="font-medium">{stats.mostLoggedFlavor || "None"}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
              <CardDescription>Your flavor logging history over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {/* Chart would go here - simplified for this example */}
                <div className="flex h-full items-end space-x-2">
                  {Object.entries(stats.flavorsByMonth).map(([month, count]) => (
                    <div key={month} className="flex flex-col items-center">
                      <div
                        className="bg-primary w-10 rounded-t-md"
                        style={{ height: `${Math.min(count * 20, 250)}px` }}
                      ></div>
                      <span className="text-xs mt-2">{month}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ratings">
          <Card>
            <CardHeader>
              <CardTitle>Rating Distribution</CardTitle>
              <CardDescription>How you've rated your ice cream experiences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1].map((rating) => {
                  const count = stats.ratingDistribution[rating.toString()] || 0
                  const percentage = stats.totalFlavorsLogged > 0 ? (count / stats.totalFlavorsLogged) * 100 : 0

                  return (
                    <div key={rating} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>{rating}/10</span>
                        <span>
                          {count} flavor{count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
