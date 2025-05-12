import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RealTimeDashboard } from "@/components/admin/analytics/real-time-dashboard"
import { AppUsageOverview } from "@/components/admin/analytics/app-usage-overview"
import { InstallationMetrics } from "@/components/admin/analytics/installation-metrics"
import { EngagementMetrics } from "@/components/admin/analytics/engagement-metrics"
import { PlatformBreakdown } from "@/components/admin/analytics/platform-breakdown"
import { FeatureUsage } from "@/components/admin/analytics/feature-usage"
import { RetentionChart } from "@/components/admin/analytics/retention-chart"
import { UserActivityHeatmap } from "@/components/admin/analytics/user-activity-heatmap"
import { formatDistanceToNow, subDays, format } from "date-fns"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()

  // Get user stats
  const { data: userStats, error: userError } = await supabase.rpc("get_user_stats")

  // Get flavor stats
  const { data: flavorStats, error: flavorError } = await supabase.rpc("get_flavor_stats")

  // Get shop stats
  const { data: shopStats, error: shopError } = await supabase.rpc("get_shop_stats")

  // Get recent signups
  const { data: recentSignups, error: signupsError } = await supabase
    .from("profiles")
    .select("id, full_name, email, created_at, role")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get recent flavors
  const { data: recentFlavors, error: flavorsError } = await supabase
    .from("flavors")
    .select("id, name, created_at, user_id, shop_id, status")
    .order("created_at", { ascending: false })
    .limit(5)

  // Get platform usage data
  const { data: platformData, error: platformError } = await supabase.rpc("get_platform_usage")

  // Get feature usage data
  const { data: featureData, error: featureError } = await supabase.rpc("get_feature_usage")

  // Get user activity data
  const { data: activityData, error: activityError } = await supabase.rpc("get_user_activity")

  // Get retention data
  const { data: retentionData, error: retentionError } = await supabase.rpc("get_user_retention")

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
    "30d": Array.from({ length: 30 }, (_, i) => {
      const date = subDays(now, 29 - i)
      return {
        date: format(date, "MMM dd"),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        newUsers: Math.floor(Math.random() * 20) + 10,
        flavorLogs: Math.floor(Math.random() * 30) + 20,
      }
    }),
    "90d": Array.from({ length: 12 }, (_, i) => {
      const date = subDays(now, 90 - i * 7)
      return {
        date: format(date, "MMM dd"),
        activeUsers: Math.floor(Math.random() * 50) + 100,
        newUsers: Math.floor(Math.random() * 20) + 10,
        flavorLogs: Math.floor(Math.random() * 30) + 20,
      }
    }),
  }

  // Handle errors
  if (
    userError ||
    flavorError ||
    shopError ||
    signupsError ||
    flavorsError ||
    platformError ||
    featureError ||
    activityError ||
    retentionError
  ) {
    console.error("Error fetching analytics data:", {
      userError,
      flavorError,
      shopError,
      signupsError,
      flavorsError,
      platformError,
      featureError,
      activityError,
      retentionError,
    })
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
            <div className="text-2xl font-bold">{userStats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">+{userStats?.new_users_last_week || 0} in the last week</p>
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
            <div className="text-2xl font-bold">{flavorStats?.total_flavors || 0}</div>
            <p className="text-xs text-muted-foreground">+{flavorStats?.new_flavors_last_week || 0} in the last week</p>
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
            <div className="text-2xl font-bold">{shopStats?.total_shops || 0}</div>
            <p className="text-xs text-muted-foreground">
              {shopStats?.claimed_shops || 0} claimed (
              {Math.round(((shopStats?.claimed_shops || 0) / (shopStats?.total_shops || 1)) * 100)}%)
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
            <div className="text-2xl font-bold">{shopStats?.premium_shops || 0}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round(((shopStats?.premium_shops || 0) / (shopStats?.claimed_shops || 1)) * 100)}% of claimed shops
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
                <AppUsageOverview data={appUsageData} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Recent Signups</CardTitle>
                <CardDescription>New users who joined recently</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentSignups?.map((user) => (
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
                <PlatformBreakdown data={platformData || []} />
              </CardContent>
            </Card>
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Feature Usage</CardTitle>
                <CardDescription>Most used features in the platform</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <FeatureUsage data={featureData || []} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="realtime" className="space-y-4">
          <RealTimeDashboard />
        </TabsContent>
        <TabsContent value="engagement" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>User Activity</CardTitle>
                <CardDescription>Daily active users over time</CardDescription>
              </CardHeader>
              <CardContent>
                <UserActivityHeatmap data={activityData || []} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Installation Metrics</CardTitle>
                <CardDescription>App installations over time</CardDescription>
              </CardHeader>
              <CardContent>
                <InstallationMetrics />
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
                <EngagementMetrics />
              </CardContent>
            </Card>
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest platform activity</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {recentFlavors?.map((flavor) => (
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
              <RetentionChart data={retentionData || []} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
