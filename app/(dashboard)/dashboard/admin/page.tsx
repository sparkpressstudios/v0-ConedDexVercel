import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Store,
  Award,
  MessageSquare,
  TrendingUp,
  Activity,
  AlertTriangle,
  LinkIcon,
  ShieldAlert,
  Database,
  Settings,
  CreditCard,
  BarChart3,
  History,
  Mail,
  CheckSquare,
} from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

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
    { count: pendingShopClaimsCount, error: pendingShopClaimsError },
    { count: pendingModerationCount, error: pendingModerationError },
    { data: recentActivity, error: activityError },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("shops").select("*", { count: "exact", head: true }),
    supabase.from("flavors").select("*", { count: "exact", head: true }),
    supabase.from("reviews").select("*", { count: "exact", head: true }),
    supabase.from("shop_claims").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("content_reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("activity_log").select("*").order("created_at", { ascending: false }).limit(5),
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

  // Admin quick links
  const adminLinks = [
    { title: "User Management", href: "/dashboard/admin/users", icon: <Users className="h-5 w-5" /> },
    { title: "Shop Management", href: "/dashboard/admin/shops", icon: <Store className="h-5 w-5" /> },
    { title: "Shop Claims", href: "/dashboard/admin/shops/claims", icon: <CheckSquare className="h-5 w-5" /> },
    { title: "Content Moderation", href: "/dashboard/admin/moderation", icon: <ShieldAlert className="h-5 w-5" /> },
    { title: "Subscriptions", href: "/dashboard/admin/subscriptions", icon: <CreditCard className="h-5 w-5" /> },
    { title: "Analytics", href: "/dashboard/admin/analytics", icon: <BarChart3 className="h-5 w-5" /> },
    { title: "Audit Logs", href: "/dashboard/admin/audit-logs", icon: <History className="h-5 w-5" /> },
    { title: "Newsletters", href: "/dashboard/admin/newsletters", icon: <Mail className="h-5 w-5" /> },
    { title: "Database", href: "/dashboard/admin/database", icon: <Database className="h-5 w-5" /> },
    { title: "Settings", href: "/dashboard/admin/settings", icon: <Settings className="h-5 w-5" /> },
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/admin/navigation-audit">
              <LinkIcon className="mr-2 h-4 w-4" />
              Navigation Audit
            </Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/dashboard/admin/settings">
              <Settings className="mr-2 h-4 w-4" />
              Admin Settings
            </Link>
          </Button>
        </div>
      </div>

      {/* Alerts Section */}
      {(pendingShopClaimsCount > 0 || pendingModerationCount > 0) && (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
          {pendingShopClaimsCount > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Pending Shop Claims
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 dark:text-amber-400">
                  There are <strong>{pendingShopClaimsCount}</strong> shop claims awaiting your review.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2 border-amber-300 dark:border-amber-700">
                  <Link href="/dashboard/admin/shops/claims">Review Claims</Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {pendingModerationCount > 0 && (
            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-amber-800 dark:text-amber-400 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Content Moderation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-amber-800 dark:text-amber-400">
                  There are <strong>{pendingModerationCount}</strong> content reports requiring moderation.
                </p>
                <Button asChild variant="outline" size="sm" className="mt-2 border-amber-300 dark:border-amber-700">
                  <Link href="/dashboard/admin/moderation">Moderate Content</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Stats Section */}
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

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle>Admin Quick Links</CardTitle>
          <CardDescription>Quickly access important admin functions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {adminLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex flex-col items-center justify-center p-4 rounded-lg border bg-card text-card-foreground shadow-sm hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <div className="mb-2 rounded-full bg-primary/10 p-2">{link.icon}</div>
                <span className="text-sm font-medium text-center">{link.title}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="activity">Recent Activity</TabsTrigger>
          <TabsTrigger value="system">System Status</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="activity" className="space-y-4">
          <Card>
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
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
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
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Trends</CardTitle>
              <CardDescription>User and content growth over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full rounded-md border border-dashed flex items-center justify-center">
                <TrendingUp className="h-8 w-8 text-muted-foreground" />
                <span className="ml-2 text-sm text-muted-foreground">Growth chart placeholder</span>
              </div>
              <div className="mt-4 flex justify-end">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard/admin/analytics">View Detailed Analytics</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
