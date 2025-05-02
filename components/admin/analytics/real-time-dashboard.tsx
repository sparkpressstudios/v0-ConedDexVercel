"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { RefreshCw, Users, MousePointer, Clock } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

// Add these functions at the top of the component
const fetchRealtimeData = async () => {
  const supabase = createClient()
  const now = new Date()
  const thirtyMinutesAgo = new Date(now.getTime() - 30 * 60 * 1000)

  try {
    // Get active users in the last 30 minutes
    const { data: activeUsers, error: usersError } = await supabase
      .from("analytics_events")
      .select("distinct user_id")
      .gte("created_at", thirtyMinutesAgo.toISOString())

    if (usersError) throw usersError

    // Get page views in the last 30 minutes
    const { data: pageViews, error: viewsError } = await supabase
      .from("analytics_events")
      .select("*")
      .eq("event_type", "page_view")
      .gte("created_at", thirtyMinutesAgo.toISOString())

    if (viewsError) throw viewsError

    // Get user actions in the last 30 minutes
    const { data: actions, error: actionsError } = await supabase
      .from("analytics_events")
      .select("*")
      .neq("event_type", "page_view")
      .gte("created_at", thirtyMinutesAgo.toISOString())

    if (actionsError) throw actionsError

    // Get time series data for the chart
    const { data: timeSeriesData, error: timeSeriesError } = await supabase.rpc("get_analytics_time_series", {
      start_time: thirtyMinutesAgo.toISOString(),
      end_time: now.toISOString(),
      interval_minutes: 1,
    })

    if (timeSeriesError) throw timeSeriesError

    return {
      activeUsers: activeUsers?.length || 0,
      pageViews: pageViews?.length || 0,
      actions: actions?.length || 0,
      timeSeriesData: timeSeriesData || [],
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return null
  }
}

// Sample data - in a real app, this would come from a real-time API
const generateInitialData = () => {
  const now = new Date()
  const data = []

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 20000) // 20 second intervals
    data.push({
      time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      activeUsers: Math.floor(Math.random() * 30) + 70,
      pageViews: Math.floor(Math.random() * 50) + 100,
      actions: Math.floor(Math.random() * 20) + 30,
    })
  }

  return data
}

export function RealTimeDashboard() {
  const [data, setData] = useState<any[]>([])
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [currentActiveUsers, setCurrentActiveUsers] = useState(0)
  const [currentPageViews, setCurrentPageViews] = useState(0)
  const [currentActions, setCurrentActions] = useState(0)

  // Calculate current stats
  // const currentActiveUsers = data[data.length - 1]?.activeUsers || 0
  // const currentPageViews = data[data.length - 1]?.pageViews || 0
  // const currentActions = data[data.length - 1]?.actions || 0

  // Calculate trends (comparing to 5 minutes ago)
  const usersTrend = currentActiveUsers - (data[0]?.activeUsers || 0)
  const pageViewsTrend = currentPageViews - (data[0]?.pageViews || 0)
  const actionsTrend = currentActions - (data[0]?.actions || 0)

  // Update the useEffect hook that handles data fetching
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    const updateData = async () => {
      const now = new Date()
      setLastUpdated(now)

      const analyticsData = await fetchRealtimeData()

      if (analyticsData) {
        setCurrentActiveUsers(analyticsData.activeUsers)
        setCurrentPageViews(analyticsData.pageViews)
        setCurrentActions(analyticsData.actions)

        if (analyticsData.timeSeriesData?.length) {
          setData(
            analyticsData.timeSeriesData.map((item) => ({
              time: new Date(item.time_bucket).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              }),
              activeUsers: item.active_users,
              pageViews: item.page_views,
              actions: item.actions,
            })),
          )
        }
      }
    }

    // Initial data fetch
    updateData()

    if (autoRefresh) {
      interval = setInterval(updateData, 60000) // Update every minute
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [autoRefresh])

  const handleRefresh = () => {
    const now = new Date()
    setLastUpdated(now)

    setData((prevData) => {
      const newData = [...prevData.slice(1)]
      newData.push({
        time: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
        activeUsers: Math.floor(Math.random() * 30) + 70,
        pageViews: Math.floor(Math.random() * 50) + 100,
        actions: Math.floor(Math.random() * 20) + 30,
      })
      return newData
    })
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Real-Time Analytics</CardTitle>
            <CardDescription>Live user activity on the platform</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-muted-foreground flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <Button variant="outline" size="sm" onClick={handleRefresh} className="h-8">
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
            <Button
              variant={autoRefresh ? "default" : "outline"}
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className="h-8"
            >
              {autoRefresh ? "Auto-Refresh On" : "Auto-Refresh Off"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Active Users</p>
                    <h3 className="text-2xl font-bold">{currentActiveUsers}</h3>
                  </div>
                </div>
                <Badge variant={usersTrend >= 0 ? "default" : "destructive"}>
                  {usersTrend >= 0 ? "+" : ""}
                  {usersTrend}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MousePointer className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Page Views</p>
                    <h3 className="text-2xl font-bold">{currentPageViews}</h3>
                  </div>
                </div>
                <Badge variant={pageViewsTrend >= 0 ? "default" : "destructive"}>
                  {pageViewsTrend >= 0 ? "+" : ""}
                  {pageViewsTrend}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <MousePointer className="h-5 w-5 mr-2 text-primary" />
                  <div>
                    <p className="text-sm font-medium">User Actions</p>
                    <h3 className="text-2xl font-bold">{currentActions}</h3>
                  </div>
                </div>
                <Badge variant={actionsTrend >= 0 ? "default" : "destructive"}>
                  {actionsTrend >= 0 ? "+" : ""}
                  {actionsTrend}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList className="mb-4">
            <TabsTrigger value="users">Active Users</TabsTrigger>
            <TabsTrigger value="pageViews">Page Views</TabsTrigger>
            <TabsTrigger value="actions">User Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="pageViews" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="pageViews"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="actions" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="actions"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Pages</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">/dashboard</span>
                  <Badge variant="outline">42 users</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">/shops/map</span>
                  <Badge variant="outline">28 users</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">/flavors</span>
                  <Badge variant="outline">19 users</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">/log-flavor</span>
                  <Badge variant="outline">15 users</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex justify-between items-center">
                  <span className="text-sm">View Shop Details</span>
                  <Badge variant="outline">38 actions</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Log New Flavor</span>
                  <Badge variant="outline">24 actions</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Follow Shop</span>
                  <Badge variant="outline">17 actions</Badge>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-sm">Update Profile</span>
                  <Badge variant="outline">12 actions</Badge>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </CardContent>
    </Card>
  )
}
