"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Line,
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Sample data - in a real app, this would come from the database
const sessionData = [
  { date: "2023-04-01", avgDuration: 5.2, avgPages: 4.1 },
  { date: "2023-04-02", avgDuration: 5.5, avgPages: 4.3 },
  { date: "2023-04-03", avgDuration: 5.1, avgPages: 4.0 },
  { date: "2023-04-04", avgDuration: 5.8, avgPages: 4.5 },
  { date: "2023-04-05", avgDuration: 6.2, avgPages: 4.8 },
  { date: "2023-04-06", avgDuration: 6.0, avgPages: 4.7 },
  { date: "2023-04-07", avgDuration: 5.7, avgPages: 4.4 },
  { date: "2023-04-08", avgDuration: 5.9, avgPages: 4.6 },
  { date: "2023-04-09", avgDuration: 6.3, avgPages: 4.9 },
  { date: "2023-04-10", avgDuration: 6.5, avgPages: 5.1 },
  { date: "2023-04-11", avgDuration: 6.8, avgPages: 5.3 },
  { date: "2023-04-12", avgDuration: 6.7, avgPages: 5.2 },
  { date: "2023-04-13", avgDuration: 7.0, avgPages: 5.5 },
  { date: "2023-04-14", avgDuration: 7.2, avgPages: 5.6 },
]

const hourlyData = [
  { hour: "00:00", users: 12 },
  { hour: "01:00", users: 8 },
  { hour: "02:00", users: 5 },
  { hour: "03:00", users: 3 },
  { hour: "04:00", users: 2 },
  { hour: "05:00", users: 4 },
  { hour: "06:00", users: 10 },
  { hour: "07:00", users: 25 },
  { hour: "08:00", users: 48 },
  { hour: "09:00", users: 62 },
  { hour: "10:00", users: 75 },
  { hour: "11:00", users: 82 },
  { hour: "12:00", users: 88 },
  { hour: "13:00", users: 85 },
  { hour: "14:00", users: 82 },
  { hour: "15:00", users: 78 },
  { hour: "16:00", users: 74 },
  { hour: "17:00", users: 70 },
  { hour: "18:00", users: 65 },
  { hour: "19:00", users: 60 },
  { hour: "20:00", users: 55 },
  { hour: "21:00", users: 45 },
  { hour: "22:00", users: 35 },
  { hour: "23:00", users: 20 },
]

export function EngagementMetrics() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Session Metrics</CardTitle>
            <CardDescription>Average session duration and pages per session</CardDescription>
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
        <CardContent className="pt-4">
          <ChartContainer
            config={{
              avgDuration: {
                label: "Avg. Duration (min)",
                color: "hsl(var(--chart-1))",
              },
              avgPages: {
                label: "Avg. Pages",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sessionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="avgDuration"
                  stroke="var(--color-avgDuration)"
                  strokeWidth={2}
                />
                <Line yAxisId="right" type="monotone" dataKey="avgPages" stroke="var(--color-avgPages)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>User Activity by Hour</CardTitle>
          <CardDescription>Number of active users throughout the day</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={hourlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Active Users"
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                  stroke="hsl(var(--primary))"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
