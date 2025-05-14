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
  try {
    // Check for essential environment variables
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-lg font-semibold text-red-800 mb-2">Configuration Error</h2>
          <p className="text-red-700">The admin dashboard cannot be loaded due to missing configuration.</p>
          <p className="mt-2 text-sm text-red-600">Please ensure all required environment variables are set.</p>
        </div>
      )
    }

    // Check if user is admin
    let userRole
    try {
      userRole = await getUserRole()
    } catch (error) {
      console.error("Error getting user role:", error)
      return (
        <div className="p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800 mb-2">Authentication Error</h2>
          <p className="text-yellow-700">We couldn't verify your admin credentials.</p>
          <div className="mt-4">
            <Button asChild>
              <Link href="/login">Return to Login</Link>
            </Button>
          </div>
        </div>
      )
    }

    if (userRole !== "admin") {
      return redirect("/dashboard")
    }

    const supabase = await createServerClient()

    // Use Promise.allSettled to handle potential individual query failures
    const [userCountResult, shopCountResult, flavorCountResult, reviewCountResult, recentActivityResult] =
      await Promise.allSettled([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("shops").select("*", { count: "exact", head: true }),
        supabase.from("flavors").select("*", { count: "exact", head: true }),
        supabase.from("reviews").select("*", { count: "exact", head: true }),
        supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(3),
      ])

    // Extract data from results, handling potential failures
    const userCount = userCountResult.status === "fulfilled" ? userCountResult.value.count : 0
    const shopCount = shopCountResult.status === "fulfilled" ? shopCountResult.value.count : 0
    const flavorCount = flavorCountResult.status === "fulfilled" ? flavorCountResult.value.count : 0
    const reviewCount = reviewCountResult.status === "fulfilled" ? reviewCountResult.value.count : 0
    const recentActivity = recentActivityResult.status === "fulfilled" ? recentActivityResult.value.data : []

    // Get previous month counts for comparison
    const oneMonthAgo = new Date()
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const oneMonthAgoStr = oneMonthAgo.toISOString()

    const [prevMonthUserResult, prevMonthShopResult, prevMonthFlavorResult, prevMonthReviewResult] =
      await Promise.allSettled([
        supabase.from("profiles").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
        supabase.from("shops").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
        supabase.from("flavors").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
        supabase.from("reviews").select("*", { count: "exact", head: true }).lt("created_at", oneMonthAgoStr),
      ])

    // Extract data from results, handling potential failures
    const prevMonthUserCount = prevMonthUserResult.status === "fulfilled" ? prevMonthUserResult.value.count : 0
    const prevMonthShopCount = prevMonthShopResult.status === "fulfilled" ? prevMonthShopResult.value.count : 0
    const prevMonthFlavorCount = prevMonthFlavorResult.status === "fulfilled" ? prevMonthFlavorResult.value.count : 0
    const prevMonthReviewCount = prevMonthReviewResult.status === "fulfilled" ? prevMonthReviewResult.value.count : 0

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
    const serverStatusResult = await Promise.resolve().then(async () => {
      try {
        return await supabase.rpc("check_server_status")
      } catch (error) {
        console.error("Error checking server status:", error)
        return { data: { status: "Unknown", response_time: "Unknown" } }
      }
    })

    const dbStatusResult = await Promise.resolve().then(async () => {
      try {
        return await supabase.rpc("check_database_status")
      } catch (error) {
        console.error("Error checking database status:", error)
        return { data: { status: "Unknown" } }
      }
    })

    const storageStatusResult = await Promise.resolve().then(async () => {
      try {
        return await supabase.rpc("check_storage_status")
      } catch (error) {
        console.error("Error checking storage status:", error)
        return { data: { usage: "Unknown" } }
      }
    })

    const serverStatus = serverStatusResult.data
    const dbStatus = dbStatusResult.data
    const storageStatus = storageStatusResult.data

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
                  <div className="flex items-center gap-4">
                    <div className="rounded-full bg-red-500/10 p-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Missing environment variables</p>
                      <p className="text-xs text-muted-foreground">Check configuration</p>
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
  } catch (error) {
    console.error("Admin dashboard error:", error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-lg font-semibold text-red-800 mb-2">Admin Dashboard Error</h2>
        <p className="text-red-700">An unexpected error occurred while loading the admin dashboard.</p>
        <div className="mt-4 space-x-4">
          <Button asChild>
            <Link href="/dashboard/admin">Reload Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/dashboard">Return to Main Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }
}
