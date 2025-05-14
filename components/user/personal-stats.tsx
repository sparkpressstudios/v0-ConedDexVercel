"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCachedUserLogs } from "@/hooks/use-cached-data"
import { IceCream, TrendingUp, MapPin, Star } from "lucide-react"

// Demo data for stats
const demoStats = {
  totalLogs: 24,
  uniqueFlavors: 20,
  uniqueShops: 8,
  topCategories: [
    { category: "chocolate", count: 7 },
    { category: "fruit", count: 5 },
    { category: "classic", count: 4 },
    { category: "cookies", count: 3 },
    { category: "nuts", count: 2 },
  ],
  topRatedFlavors: [
    { name: "Cookie Dough Delight", rating: 5, shop: "Cookie Monster's Creamery" },
    { name: "Chocolate Fudge Brownie", rating: 5, shop: "Sweet Scoops Ice Cream" },
    { name: "Mint Chocolate Chip", rating: 4.8, shop: "Minty Fresh Ice Cream" },
    { name: "Vanilla Bean Dream", rating: 4.5, shop: "Sweet Scoops Ice Cream" },
    { name: "Strawberry Fields", rating: 4, shop: "Frosty's Delights" },
  ],
  monthlyActivity: [
    { month: "Jan", count: 0 },
    { month: "Feb", count: 0 },
    { month: "Mar", count: 0 },
    { month: "Apr", count: 0 },
    { month: "May", count: 8 },
    { month: "Jun", count: 16 },
    { month: "Jul", count: 0 },
    { month: "Aug", count: 0 },
    { month: "Sep", count: 0 },
    { month: "Oct", count: 0 },
    { month: "Nov", count: 0 },
    { month: "Dec", count: 0 },
  ],
  mostVisitedShops: [
    { name: "Sweet Scoops Ice Cream", visits: 5 },
    { name: "Cookie Monster's Creamery", visits: 3 },
    { name: "Frosty's Delights", visits: 2 },
    { name: "Minty Fresh Ice Cream", visits: 1 },
  ],
}

export default function PersonalStats({ userId, isDemoUser = false }) {
  const [stats, setStats] = useState(demoStats)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use the cached data hook for real users
  const {
    data: userLogs,
    isLoading: logsLoading,
    error: logsError,
  } = useCachedUserLogs(isDemoUser ? undefined : userId)

  useEffect(() => {
    // If we're using a demo user, set the demo data
    if (isDemoUser) {
      setStats(demoStats)
      setIsLoading(false)
      return
    }

    // If we're still loading logs, wait
    if (logsLoading) {
      setIsLoading(true)
      return
    }

    // If we have an error from the cache, set it
    if (logsError) {
      console.error("Error fetching user logs:", logsError)
      setError(logsError)
      setIsLoading(false)
      // Fallback to demo data
      setStats(demoStats)
      return
    }

    // If we have logs, calculate stats
    if (userLogs) {
      try {
        const calculatedStats = calculateStats(userLogs)
        setStats(calculatedStats)
      } catch (err) {
        console.error("Error calculating stats:", err)
        setError(err)
        // Fallback to demo data
        setStats(demoStats)
      }
      setIsLoading(false)
    } else {
      // If we don't have logs, use demo data
      setStats(demoStats)
      setIsLoading(false)
    }
  }, [isDemoUser, userLogs, logsLoading, logsError, userId])

  // Calculate stats from logs
  const calculateStats = (logs) => {
    // Total logs
    const totalLogs = logs.length

    // Unique flavors
    const uniqueFlavors = new Set(logs.map((log) => log.flavor_id)).size

    // Unique shops
    const uniqueShops = new Set(logs.map((log) => log.shop_id)).size

    // Top categories
    const categoryCount = logs.reduce((acc, log) => {
      const category = log.flavors?.category
      if (category) {
        acc[category] = (acc[category] || 0) + 1
      }
      return acc
    }, {})

    const topCategories = Object.entries(categoryCount)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // Top rated flavors
    const topRatedFlavors = [...logs]
      .filter((log) => log.rating && log.flavors?.name)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((log) => ({
        name: log.flavors?.name || "Unknown Flavor",
        rating: log.rating,
        shop: log.shops?.name || "Unknown Shop",
      }))

    // Monthly activity
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const currentYear = new Date().getFullYear()

    const monthlyActivity = months.map((month) => {
      const monthIndex = months.indexOf(month)
      const count = logs.filter((log) => {
        const logDate = new Date(log.visit_date || log.created_at)
        return logDate.getMonth() === monthIndex && logDate.getFullYear() === currentYear
      }).length
      return { month, count }
    })

    // Most visited shops
    const shopVisits = logs.reduce((acc, log) => {
      const shopId = log.shop_id
      const shopName = log.shops?.name || "Unknown Shop"

      if (shopId) {
        if (!acc[shopId]) {
          acc[shopId] = { name: shopName, visits: 0 }
        }
        acc[shopId].visits += 1
      }

      return acc
    }, {})

    const mostVisitedShops = Object.values(shopVisits)
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 5)

    return {
      totalLogs,
      uniqueFlavors,
      uniqueShops,
      topCategories,
      topRatedFlavors,
      monthlyActivity,
      mostVisitedShops,
    }
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Flavors Logged</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <IceCream className="h-5 w-5 text-pink-500 mr-2" />
                  <span className="text-2xl font-bold">{isLoading ? "-" : stats.totalLogs}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Unique Flavors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Star className="h-5 w-5 text-amber-500 mr-2" />
                  <span className="text-2xl font-bold">{isLoading ? "-" : stats.uniqueFlavors}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Shops Visited</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-500 mr-2" />
                  <span className="text-2xl font-bold">{isLoading ? "-" : stats.uniqueShops}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Top Categories</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : stats.topCategories.length > 0 ? (
                  <div className="space-y-4">
                    {stats.topCategories.map((item) => (
                      <div key={item.category} className="flex items-center justify-between">
                        <span className="capitalize">{item.category}</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{item.count}</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary"
                              style={{
                                width: `${(item.count / stats.totalLogs) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No category data available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Most Visited Shops</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-6 bg-muted animate-pulse rounded" />
                    ))}
                  </div>
                ) : stats.mostVisitedShops.length > 0 ? (
                  <div className="space-y-4">
                    {stats.mostVisitedShops.map((shop) => (
                      <div key={shop.name} className="flex items-center justify-between">
                        <span className="truncate max-w-[200px]">{shop.name}</span>
                        <div className="flex items-center">
                          <span className="text-sm font-medium mr-2">{shop.visits}</span>
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{
                                width: `${(shop.visits / Math.max(...stats.mostVisitedShops.map((s) => s.visits))) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm">No shop visit data available</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Activity</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-64 bg-muted animate-pulse rounded" />
              ) : (
                <div className="h-64 relative">
                  <div className="absolute inset-0 flex items-end">
                    {stats.monthlyActivity.map((month) => (
                      <div key={month.month} className="flex-1 flex flex-col items-center">
                        <div
                          className="w-full max-w-[30px] bg-primary rounded-t"
                          style={{
                            height: `${(month.count / Math.max(...(stats.monthlyActivity.map((m) => m.count) || [1]))) * 100}%`,
                            minHeight: month.count > 0 ? "4px" : "0",
                          }}
                        />
                        <div className="text-xs mt-2">{month.month}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Flavor Exploration Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-8">
                  <div className="flex flex-col items-center text-center">
                    <TrendingUp className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      More detailed trends will be available as you log more flavors.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Rated Flavors</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded" />
                  ))}
                </div>
              ) : stats.topRatedFlavors.length > 0 ? (
                <div className="space-y-4">
                  {stats.topRatedFlavors.map((flavor, index) => (
                    <div key={index} className="flex items-start p-3 rounded-lg border">
                      <div className="flex-1">
                        <h4 className="font-medium">{flavor.name}</h4>
                        <p className="text-sm text-muted-foreground">{flavor.shop}</p>
                      </div>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{flavor.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <Star className="h-16 w-16 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    You haven't rated any flavors yet. Start rating flavors to see your favorites!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
