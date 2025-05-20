import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, TrendingUp, Users } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function AdminAnalyticsOverview() {
  const supabase = createServerComponentClient({ cookies })

  // Get total users count
  const { count: totalUsers, error: usersError } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Get total shops count
  const { count: totalShops, error: shopsError } = await supabase
    .from("shops")
    .select("*", { count: "exact", head: true })

  // Get total flavor logs count
  const { count: totalFlavorLogs, error: logsError } = await supabase
    .from("flavor_logs")
    .select("*", { count: "exact", head: true })

  // Get total check-ins count
  const { count: totalCheckins, error: checkinsError } = await supabase
    .from("shop_checkins")
    .select("*", { count: "exact", head: true })

  // Calculate month-over-month growth (placeholder values)
  const userGrowth = 12
  const shopGrowth = 8
  const flavorLogGrowth = 15
  const checkinGrowth = 10

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalUsers?.toLocaleString() || "0"}</div>
          <p className="text-xs text-muted-foreground">+{userGrowth}% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Shops</CardTitle>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4 text-muted-foreground"
          >
            <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
            <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
            <path d="M12 3v6" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalShops?.toLocaleString() || "0"}</div>
          <p className="text-xs text-muted-foreground">+{shopGrowth}% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flavor Logs</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalFlavorLogs?.toLocaleString() || "0"}</div>
          <p className="text-xs text-muted-foreground">+{flavorLogGrowth}% from last month</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalCheckins?.toLocaleString() || "0"}</div>
          <p className="text-xs text-muted-foreground">+{checkinGrowth}% from last month</p>
        </CardContent>
      </Card>
    </div>
  )
}
