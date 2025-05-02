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
  Bar,
  BarChart,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

// Sample data - in a real app, this would come from the database
const installationData = [
  { date: "2023-04-01", installations: 12, android: 7, ios: 5 },
  { date: "2023-04-02", installations: 18, android: 10, ios: 8 },
  { date: "2023-04-03", installations: 15, android: 8, ios: 7 },
  { date: "2023-04-04", installations: 25, android: 15, ios: 10 },
  { date: "2023-04-05", installations: 32, android: 18, ios: 14 },
  { date: "2023-04-06", installations: 28, android: 16, ios: 12 },
  { date: "2023-04-07", installations: 20, android: 11, ios: 9 },
  { date: "2023-04-08", installations: 22, android: 12, ios: 10 },
  { date: "2023-04-09", installations: 30, android: 17, ios: 13 },
  { date: "2023-04-10", installations: 35, android: 20, ios: 15 },
  { date: "2023-04-11", installations: 40, android: 22, ios: 18 },
  { date: "2023-04-12", installations: 38, android: 21, ios: 17 },
  { date: "2023-04-13", installations: 42, android: 24, ios: 18 },
  { date: "2023-04-14", installations: 48, android: 26, ios: 22 },
]

const platformData = [
  { name: "Android", value: 58 },
  { name: "iOS", value: 42 },
]

const sourceData = [
  { name: "Direct", value: 35 },
  { name: "App Store", value: 25 },
  { name: "Play Store", value: 30 },
  { name: "Website", value: 10 },
]

export function InstallationMetrics() {
  const [timeframe, setTimeframe] = useState("30d")

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card className="col-span-2">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Installation Trend</CardTitle>
            <CardDescription>Daily app installations over time</CardDescription>
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
              installations: {
                label: "Total Installations",
                color: "hsl(var(--chart-1))",
              },
              android: {
                label: "Android",
                color: "hsl(var(--chart-2))",
              },
              ios: {
                label: "iOS",
                color: "hsl(var(--chart-3))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={installationData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line type="monotone" dataKey="installations" stroke="var(--color-installations)" strokeWidth={2} />
                <Line type="monotone" dataKey="android" stroke="var(--color-android)" />
                <Line type="monotone" dataKey="ios" stroke="var(--color-ios)" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform Distribution</CardTitle>
          <CardDescription>Installations by platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={platformData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Installation Sources</CardTitle>
          <CardDescription>Where users are installing from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Percentage" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
