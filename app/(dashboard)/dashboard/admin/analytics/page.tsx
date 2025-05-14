"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { format, subDays } from "date-fns"

export default function AdminAnalyticsPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState({
    userStats: { total_users: 0, new_users_last_week: 0 },
    flavorStats: { total_flavors: 0, new_flavors_last_week: 0 },
    shopStats: { total_shops: 0, claimed_shops: 0, premium_shops: 0 },
    recentSignups: [],
    recentFlavors: [],
    platformData: [],
    featureData: [],
    activityData: [],
    retentionData: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // In a real app, this would be an API call
        // For now, we'll simulate with mock data
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        setData({
          userStats: { total_users: 1245, new_users_last_week: 87 },
          flavorStats: { total_flavors: 3782, new_flavors_last_week: 156 },
          shopStats: { total_shops: 342, claimed_shops: 218, premium_shops: 124 },
          recentSignups: [
            { id: 1, full_name: "John Smith", email: "john@example.com", created_at: new Date().toISOString() },
            {
              id: 2,
              full_name: "Sarah Johnson",
              email: "sarah@example.com",
              created_at: new Date(Date.now() - 86400000).toISOString(),
            },
            {
              id: 3,
              full_name: "Michael Chen",
              email: "michael@example.com",
              created_at: new Date(Date.now() - 172800000).toISOString(),
            },
          ],
          recentFlavors: [
            { id: 1, name: "Chocolate Fudge", created_at: new Date().toISOString(), status: "approved" },
            {
              id: 2,
              name: "Strawberry Swirl",
              created_at: new Date(Date.now() - 86400000).toISOString(),
              status: "pending",
            },
            {
              id: 3,
              name: "Mint Chip",
              created_at: new Date(Date.now() - 172800000).toISOString(),
              status: "approved",
            },
          ],
          platformData: [
            { name: "iOS", value: 45 },
            { name: "Android", value: 35 },
            { name: "Web", value: 20 },
          ],
          featureData: [
            { name: "Flavor Logging", value: 85 },
            { name: "Shop Discovery", value: 65 },
            { name: "Social Sharing", value: 40 },
            { name: "Badges", value: 30 },
          ],
          activityData: [],
          retentionData: [],
        })
      } catch (err) {
        console.error("Error fetching analytics data:", err)
        setError("Failed to load analytics data. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare app usage data
  const now = new Date()
  const appUsageData = {
    "7d": Array.from({ length: 7 }, (_, i) => {
      const date = subDays(now, 6 - i)
      return {
        date: format(date, "MMM dd"),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        newUsers: Math.floor(Math.random() * 20) + 10,
        flavorLogs: Math.floor(Math.random() * 30) + 20,
      }
    }),
  }

  if (isLoading) {
    return <AnalyticsPageSkeleton />
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Analytics</h2>
        <p className="text-red-700">{error}</p>
        <button
          className="mt-4 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Monitor platform performance, user engagement, and content metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.userStats.total_users}</div>
            <p className="text-xs text-muted-foreground">+{data.userStats.new_users_last_week} in the last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flavors Logged</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.flavorStats.total_flavors}</div>
            <p className="text-xs text-muted-foreground">+{data.flavorStats.new_flavors_last_week} in the last week</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shops Listed</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.shopStats.total_shops}</div>
            <p className="text-xs text-muted-foreground">
              {data.shopStats.claimed_shops} claimed (
              {Math.round((data.shopStats.claimed_shops / data.shopStats.total_shops) * 100)}%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscriptions</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.shopStats.premium_shops}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((data.shopStats.premium_shops / data.shopStats.claimed_shops) * 100)}% of claimed shops
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="realtime">Real-Time</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>App Usage Overview</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">App usage chart placeholder</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>New users who joined recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.recentSignups.map((user: any) => (
                    <div className="flex items-center" key={user.id}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{user.full_name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Platform Breakdown</CardTitle>
                <CardDescription>User devices and browsers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Platform breakdown chart placeholder</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used features in the platform</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Feature usage chart placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="realtime" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-Time Dashboard</CardTitle>
              <CardDescription>Live user activity and system metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-md border border-dashed flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Real-time dashboard placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">User activity heatmap placeholder</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Installation Metrics</CardTitle>
                <CardDescription>App installations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Installation metrics placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
                <CardDescription>User engagement statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <span className="text-sm text-muted-foreground">Engagement metrics placeholder</span>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.recentFlavors.map((flavor: any) => (
                    <div className="flex items-center" key={flavor.id}>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{flavor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: <span className="capitalize">{flavor.status}</span>
                        </p>
                      </div>
                      <div className="ml-auto font-medium">
                        {formatDistanceToNow(new Date(flavor.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="retention" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Retention</CardTitle>
              <CardDescription>How well users are retained over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px] w-full rounded-md border border-dashed flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Retention chart placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function formatDistanceToNow(date: Date, options: { addSuffix: boolean }) {
  const now = new Date()
  const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays === 0) {
    return "today"
  } else if (diffInDays === 1) {
    return "yesterday"
  } else {
    return `${diffInDays} days ago`
  }
}

function AnalyticsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-16 mb-2" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <Skeleton className="h-10 w-96 mb-4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[300px] w-full" />
              </CardContent>
            </Card>
          </div>
          <div className="col-span-3">
            <Card>
              <CardHeader>
                <Skeleton className="h-5 w-40 mb-2" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div className="flex items-center" key={i}>
                      <div className="space-y-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                      <div className="ml-auto">
                        <Skeleton className="h-4 w-16" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
