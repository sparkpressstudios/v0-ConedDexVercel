"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSupabaseClient } from "@supabase/auth-helpers-react"
import { Loader2 } from "lucide-react"

export function RealtimeAnalytics({ shopId }: { shopId: string }) {
  const [activeVisitors, setActiveVisitors] = useState<number>(0)
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const supabase = useSupabaseClient()

  useEffect(() => {
    // Simulate fetching initial data
    const fetchInitialData = async () => {
      try {
        setIsLoading(true)

        // In a real implementation, this would fetch actual data from the database
        // For now, using placeholder data
        setActiveVisitors(Math.floor(Math.random() * 20) + 5)

        const mockActivities = [
          {
            id: 1,
            type: "view",
            description: "Customer viewed Chocolate Fudge flavor",
            timestamp: new Date().toISOString(),
          },
          {
            id: 2,
            type: "log",
            description: "Customer logged Vanilla Bean flavor",
            timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
          },
          {
            id: 3,
            type: "follow",
            description: "New follower added",
            timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
          },
        ]

        setRecentActivity(mockActivities)
      } catch (error) {
        console.error("Error fetching realtime data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInitialData()

    // Set up realtime subscription
    const subscription = supabase
      .channel("realtime-analytics")
      .on("presence", { event: "sync" }, () => {
        // Update active visitors count based on presence state
        // This is a simplified example - in a real app, you'd filter by shop
        const presenceState = subscription.presenceState()
        const totalUsers = Object.keys(presenceState).length
        setActiveVisitors(totalUsers > 0 ? totalUsers : Math.floor(Math.random() * 20) + 5)
      })
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "flavor_logs",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          // Add new flavor log to recent activity
          setRecentActivity((prev) => [
            {
              id: Date.now(),
              type: "log",
              description: `Customer logged a new flavor`,
              timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 9),
          ])
        },
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "shop_followers",
          filter: `shop_id=eq.${shopId}`,
        },
        (payload) => {
          // Add new follower to recent activity
          setRecentActivity((prev) => [
            {
              id: Date.now(),
              type: "follow",
              description: `New follower added`,
              timestamp: new Date().toISOString(),
            },
            ...prev.slice(0, 9),
          ])
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [shopId, supabase])

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Live Visitor Count</CardTitle>
            <CardDescription>Loading data...</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center p-6">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Live Visitor Count</CardTitle>
          <CardDescription>Current visitors to your shop page</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{activeVisitors}</div>
              <p className="text-muted-foreground mt-2">Active visitors right now</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Real-time Activity</CardTitle>
          <CardDescription>Live feed of customer interactions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 bg-muted/20 rounded-md">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center p-6">
                <p className="text-muted-foreground">No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)

  if (diffMins < 1) return "Just now"
  if (diffMins === 1) return "1 minute ago"
  if (diffMins < 60) return `${diffMins} minutes ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours === 1) return "1 hour ago"
  if (diffHours < 24) return `${diffHours} hours ago`

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1 day ago"
  return `${diffDays} days ago`
}
