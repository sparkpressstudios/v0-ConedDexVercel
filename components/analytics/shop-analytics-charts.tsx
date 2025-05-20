"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useQuery } from "@tanstack/react-query"

type TimeFrame = "7d" | "30d" | "90d" | "1y"

export function ShopAnalyticsCharts({ shopId }: { shopId: string }) {
  const [timeframe, setTimeframe] = useState<TimeFrame>("30d")

  const { data, isLoading, error } = useQuery({
    queryKey: ["shop-analytics", shopId, timeframe],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/shop/${shopId}/timeseries?timeframe=${timeframe}`)
      if (!response.ok) {
        throw new Error("Failed to fetch analytics data")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Metrics</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Monthly Metrics</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Failed to load chart data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Prepare data for the chart
  const chartData =
    data?.visits?.map((visit: any, index: number) => ({
      date: visit.date,
      visits: visit.value,
      flavorLogs: data.flavorLogs[index]?.value || 0,
      ratings: data.ratings[index]?.value || 0,
      followers: data.followers[index]?.value || 0,
    })) || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Monthly Metrics</CardTitle>
          <CardDescription>Performance over time</CardDescription>
        </div>
        <Select value={timeframe} onValueChange={(value) => setTimeframe(value as TimeFrame)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="visits" name="Visits" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="flavorLogs" name="Flavor Logs" stroke="#82ca9d" />
              <Line type="monotone" dataKey="ratings" name="Avg Rating" stroke="#ffc658" />
              <Line type="monotone" dataKey="followers" name="New Followers" stroke="#ff8042" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
