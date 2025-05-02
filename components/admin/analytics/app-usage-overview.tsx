"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface AppUsageOverviewProps {
  data: any
  isLoading?: boolean
  error?: Error | null
}

export function AppUsageOverview({ data, isLoading, error }: AppUsageOverviewProps) {
  const [timeRange, setTimeRange] = useState("7d")

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading analytics data</AlertTitle>
        <AlertDescription>{error.message || "Failed to load analytics data. Please try again later."}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>App Usage Overview</CardTitle>
          <CardDescription>Loading analytics data...</CardDescription>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-4 w-32 bg-muted rounded mb-4"></div>
            <div className="h-40 w-full bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <ErrorBoundary>
      <Card>
        <CardHeader>
          <CardTitle>App Usage Overview</CardTitle>
          <CardDescription>User activity and engagement metrics</CardDescription>
          <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="mt-2">
            <TabsList>
              <TabsTrigger value="7d">7 Days</TabsTrigger>
              <TabsTrigger value="30d">30 Days</TabsTrigger>
              <TabsTrigger value="90d">90 Days</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data[timeRange] || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="activeUsers" name="Active Users" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="newUsers" name="New Users" stroke="#82ca9d" strokeWidth={2} />
              <Line type="monotone" dataKey="flavorLogs" name="Flavor Logs" stroke="#ffc658" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </ErrorBoundary>
  )
}
