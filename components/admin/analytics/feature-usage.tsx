"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Line,
  LineChart,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useState } from "react"

// Sample data - in a real app, this would come from the database
const featureUsageData = [
  { name: "Flavor Logging", count: 1250, growth: 15 },
  { name: "Shop Discovery", count: 980, growth: 8 },
  { name: "Shop Following", count: 850, growth: 12 },
  { name: "Notifications", count: 720, growth: 5 },
  { name: "Offline Mode", count: 650, growth: 20 },
  { name: "Team Management", count: 450, growth: 3 },
  { name: "Analytics", count: 380, growth: 18 },
  { name: "Marketing Tools", count: 320, growth: 25 },
]

const featureTrendData = [
  { date: "2023-04-01", flavorLogging: 80, shopDiscovery: 65, shopFollowing: 50, notifications: 45 },
  { date: "2023-04-02", flavorLogging: 82, shopDiscovery: 68, shopFollowing: 52, notifications: 46 },
  { date: "2023-04-03", flavorLogging: 85, shopDiscovery: 70, shopFollowing: 55, notifications: 48 },
  { date: "2023-04-04", flavorLogging: 88, shopDiscovery: 73, shopFollowing: 58, notifications: 50 },
  { date: "2023-04-05", flavorLogging: 90, shopDiscovery: 75, shopFollowing: 60, notifications: 52 },
  { date: "2023-04-06", flavorLogging: 92, shopDiscovery: 78, shopFollowing: 62, notifications: 54 },
  { date: "2023-04-07", flavorLogging: 95, shopDiscovery: 80, shopFollowing: 65, notifications: 56 },
  { date: "2023-04-08", flavorLogging: 98, shopDiscovery: 82, shopFollowing: 68, notifications: 58 },
  { date: "2023-04-09", flavorLogging: 100, shopDiscovery: 85, shopFollowing: 70, notifications: 60 },
  { date: "2023-04-10", flavorLogging: 102, shopDiscovery: 88, shopFollowing: 72, notifications: 62 },
  { date: "2023-04-11", flavorLogging: 105, shopDiscovery: 90, shopFollowing: 75, notifications: 65 },
  { date: "2023-04-12", flavorLogging: 108, shopDiscovery: 92, shopFollowing: 78, notifications: 68 },
  { date: "2023-04-13", flavorLogging: 110, shopDiscovery: 95, shopFollowing: 80, notifications: 70 },
  { date: "2023-04-14", flavorLogging: 112, shopDiscovery: 98, shopFollowing: 82, notifications: 72 },
]

export function FeatureUsage() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Feature Usage</CardTitle>
            <CardDescription>Most used features in the app</CardDescription>
          </div>
          <Select value={timeframe} onValueChange={setTimeframe}>
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
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureUsageData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Usage Count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Feature Usage Trends</CardTitle>
          <CardDescription>Usage trends for top features</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              flavorLogging: {
                label: "Flavor Logging",
                color: "hsl(var(--chart-1))",
              },
              shopDiscovery: {
                label: "Shop Discovery",
                color: "hsl(var(--chart-2))",
              },
              shopFollowing: {
                label: "Shop Following",
                color: "hsl(var(--chart-3))",
              },
              notifications: {
                label: "Notifications",
                color: "hsl(var(--chart-4))",
              },
            }}
            className="h-[400px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={featureTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="flavorLogging" stroke="var(--color-flavorLogging)" strokeWidth={2} />
                <Line type="monotone" dataKey="shopDiscovery" stroke="var(--color-shopDiscovery)" />
                <Line type="monotone" dataKey="shopFollowing" stroke="var(--color-shopFollowing)" />
                <Line type="monotone" dataKey="notifications" stroke="var(--color-notifications)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
