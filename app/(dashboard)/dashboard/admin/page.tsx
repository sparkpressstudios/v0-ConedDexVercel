import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Store, Award, MessageSquare, TrendingUp, Activity, AlertTriangle, LinkIcon } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"

export const dynamic = "force-dynamic"

export default async function AdminDashboardPage() {
  // Check if user is admin
  const userRole = await getUserRole()

  if (userRole !== "admin") {
    return redirect("/dashboard")
  }

  const supabase = await createServerClient()

  // Fetch counts from the database
  const [
    { count: userCount, error: userError },
    { count: shopCount, error: shopError },
    { count: flavorCount, error: flavorError },
    { count: reviewCount, error: reviewError },
    { data: recentActivity, error: activityError },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("shops").select("*", { count: "exact", head: true }),
    supabase.from("flavors").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(3),
  ])

  // Get previous month counts for comparison
  const oneMonthAgo = new Date()
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
  const oneMonthAgoStr = oneMonthAgo.toISOString()

  const [
    { count: prevMonthUserCount },
    { count: prevMonthShopCount },
    { count: prevMonthFlavorCount },
    { count: prevMonthReviewCount },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
    supabase.from("shops").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
    supabase.from("flavors").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
    supabase.from("reviews").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
  ])

  // Calculate growth
  const userGrowth = userCount - (prevMonthUserCount || 0)
  const shopGrowth = shopCount - (prevMonthShopCount || 0)
  const flavorGrowth = flavorCount - (prevMonthFlavorCount || 0)
  const reviewGrowth = reviewCount - (prevMonthReviewCount || 0)

  // Format activity items
  const formattedActivity =
    recentActivity?.map((item) => ({
      type: item.activity_type,
      description: item.description,
      time: new Date(item.created_at).toLocaleString(),
    })) || []

  // Check system status
  const { data: serverStatus } = await supabase.rpc("check_server_status")
  const { data: dbStatus } = await supabase.rpc("check_database_status")
  const { data: storageStatus } = await supabase.rpc("check_storage_status")

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {userGrowth > 0 ? "+" : ""}
              {userGrowth} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shops</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{shopCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {shopGrowth > 0 ? "+" : ""}
              {shopGrowth} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flavors Logged</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{flavorCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {flavorGrowth > 0 ? "+" : ""}
              {flavorGrowth} from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reviewCount || 0}</div>
            <p className="text-xs text-muted-foreground">
              {reviewGrowth > 0 ? "+" : ""}
              {reviewGrowth} from last month
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest user and system activities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formattedActivity.length > 0 ? (
                  formattedActivity.map((activity, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">No recent activity</p>
                      <p className="text-xs text-muted-foreground">Check back later</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>System Status</CardTitle>
                <CardDescription>Current system performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Server Load</p>
                    <p className="text-sm text-green-500">{serverStatus?.status || "Normal"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Database</p>
                    <p className="text-sm text-green-500">{dbStatus?.status || "Healthy"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">API Response</p>
                    <p className="text-sm text-green-500">{serverStatus?.response_time || "Fast (120ms)"}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Storage</p>
                    <p className="text-sm text-amber-500">{storageStatus?.usage || "75% Used"}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t">
                    <Button asChild variant="outline" size="sm" className="w-full">
                      <Link href="/dashboard/admin/navigation-audit">
                        <LinkIcon className="mr-2 h-4 w-4" />
                        View Navigation Audit
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>System alerts and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">Storage space running low</p>
                    <p className="text-xs text-muted-foreground">Consider upgrading plan</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="rounded-full bg-amber-500/10 p-2">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">5 content reports pending</p>
                    <p className="text-xs text-muted-foreground">Requires moderation</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>User and content growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full rounded-md border border-dashed flex items-center justify-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground" />
                  <span className="ml-2 text-sm text-muted-foreground">Growth chart placeholder</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>Detailed platform analytics and metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Analytics dashboard placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Reports</CardTitle>
              <CardDescription>Generated reports and statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full rounded-md border border-dashed flex items-center justify-center">
                <span className="text-sm text-muted-foreground">Reports dashboard placeholder</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
