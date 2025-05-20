"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { useQuery } from "@tanstack/react-query"

export function FlavorAnalytics({ shopId }: { shopId: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["flavor-popularity", shopId],
    queryFn: async () => {
      const response = await fetch(`/api/analytics/shop/${shopId}/flavors`)
      if (!response.ok) {
        throw new Error("Failed to fetch flavor data")
      }
      return response.json()
    },
  })

  if (isLoading) {
    return <FlavorAnalyticsLoadingSkeleton />
  }

  if (error) {
    return <FlavorAnalyticsErrorState />
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flavor Popularity</CardTitle>
          <CardDescription>Most popular flavors based on customer logs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" name="Number of Logs" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Ratings</CardTitle>
          <CardDescription>Average ratings for each flavor</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data || []} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis dataKey="name" type="category" width={100} />
                <Tooltip />
                <Legend />
                <Bar dataKey="averageRating" name="Average Rating" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FlavorAnalyticsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flavor Popularity</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Ratings</CardTitle>
          <CardDescription>Loading data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Loading chart data...</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function FlavorAnalyticsErrorState() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Flavor Popularity</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Failed to load flavor data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Flavor Ratings</CardTitle>
          <CardDescription>Error loading data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] flex items-center justify-center bg-muted/20">
            <p className="text-muted-foreground">Failed to load flavor data. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
