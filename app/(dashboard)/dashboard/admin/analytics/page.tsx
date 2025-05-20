import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InstallationMetrics } from "@/components/admin/analytics/installation-metrics"
import { EngagementMetrics } from "@/components/admin/analytics/engagement-metrics"
import { PlatformBreakdown } from "@/components/admin/analytics/platform-breakdown"
import { FeatureUsage } from "@/components/admin/analytics/feature-usage"
import { RetentionChart } from "@/components/admin/analytics/retention-chart"
import { UserActivityHeatmap } from "@/components/admin/analytics/user-activity-heatmap"
import { ExportAnalytics } from "@/components/admin/analytics/export-analytics"
import { AppUsageOverview } from "@/components/admin/analytics/app-usage-overview"
import { QuestAnalytics } from "@/components/admin/analytics/quest-analytics"
import { AdminAnalyticsOverview } from "@/components/admin/analytics/admin-analytics-overview"
import { ServerRoleGate } from "@/components/server-role-gate"

export const dynamic = "force-dynamic"

export default async function AdminAnalyticsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-lg">You must be signed in to view this page.</p>
      </div>
    )
  }

  return (
    <ServerRoleGate allowedRoles={["admin"]}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground">Platform usage statistics and performance metrics.</p>
          </div>
          <ExportAnalytics />
        </div>

        <Suspense fallback={<AnalyticsLoadingSkeleton />}>
          <AdminAnalyticsOverview />
        </Suspense>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="installations">Installations</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
            <TabsTrigger value="platform">Platform</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="retention">Retention</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Suspense fallback={<AnalyticsLoadingSkeleton />}>
              <AppUsageOverview
                data={{
                  "7d": [],
                  "30d": [],
                  "90d": [],
                }}
              />
            </Suspense>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Total Users</CardTitle>
                  <CardDescription>All registered users</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">12,345</div>
                  <p className="text-sm text-muted-foreground mt-2">+15% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Active Shops</CardTitle>
                  <CardDescription>Shops with activity in last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">1,234</div>
                  <p className="text-sm text-muted-foreground mt-2">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Flavor Logs</CardTitle>
                  <CardDescription>Total flavor logs recorded</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-bold">56,789</div>
                  <p className="text-sm text-muted-foreground mt-2">+22% from last month</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="installations">
            <InstallationMetrics />
          </TabsContent>

          <TabsContent value="engagement">
            <EngagementMetrics />
          </TabsContent>

          <TabsContent value="platform">
            <PlatformBreakdown />
          </TabsContent>

          <TabsContent value="features">
            <FeatureUsage />
          </TabsContent>

          <TabsContent value="retention">
            <div className="grid gap-4 md:grid-cols-2">
              <RetentionChart />
              <UserActivityHeatmap />
            </div>
          </TabsContent>

          <TabsContent value="quests">
            <QuestAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </ServerRoleGate>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
              <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-7 w-16 bg-muted rounded animate-pulse mb-1"></div>
              <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          <div className="h-4 w-48 bg-muted rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] bg-muted/20 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    </div>
  )
}
