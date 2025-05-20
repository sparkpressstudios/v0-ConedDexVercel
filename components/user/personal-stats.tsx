"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart, PieChart, LineChart } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
} from "recharts"

// Demo data for flavor categories
const DEMO_CATEGORY_DATA = [
  { name: "Chocolate", value: 8 },
  { name: "Vanilla", value: 5 },
  { name: "Fruit", value: 6 },
  { name: "Nuts", value: 3 },
  { name: "Other", value: 2 },
]

// Demo data for monthly logs
const DEMO_MONTHLY_DATA = [
  { name: "Jan", count: 2 },
  { name: "Feb", count: 3 },
  { name: "Mar", count: 1 },
  { name: "Apr", count: 4 },
  { name: "May", count: 5 },
  { name: "Jun", count: 7 },
  { name: "Jul", count: 2 },
]

// Demo data for ratings distribution
const DEMO_RATINGS_DATA = [
  { rating: "5 ★", count: 10 },
  { rating: "4 ★", count: 8 },
  { rating: "3 ★", count: 4 },
  { rating: "2 ★", count: 1 },
  { rating: "1 ★", count: 0 },
]

// Colors for pie chart
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82ca9d"]

interface PersonalStatsProps {
  userId?: string
  isDemoUser?: boolean
}

export function PersonalStats({ userId, isDemoUser = false }: PersonalStatsProps) {
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [ratingsData, setRatingsData] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      if (isDemoUser) {
        setCategoryData(DEMO_CATEGORY_DATA)
        setMonthlyData(DEMO_MONTHLY_DATA)
        setRatingsData(DEMO_RATINGS_DATA)
        setLoading(false)
        return
      }

      try {
        // Use the userId from props if available, otherwise use the authenticated user's ID
        const id = userId || user?.id

        if (!id) {
          console.error("No user ID available to fetch stats")
          setLoading(false)
          return
        }

        // Fetch flavor logs with flavor details
        const { data: logs, error: logsError } = await supabase
          .from("flavor_logs")
          .select(
            `
            id,
            rating,
            date_logged,
            flavors (
              id,
              name,
              category
            )
          `,
          )
          .eq("user_id", id)

        if (logsError) {
          throw logsError
        }

        // Process category data
        const categories = logs.reduce((acc, log) => {
          const category = log.flavors?.category || "Other"
          acc[category] = (acc[category] || 0) + 1
          return acc
        }, {})

        const formattedCategoryData = Object.entries(categories).map(([name, value]) => ({
          name,
          value,
        }))

        setCategoryData(formattedCategoryData)

        // Process monthly data
        const months = logs.reduce((acc, log) => {
          const date = new Date(log.date_logged)
          const monthYear = `${date.toLocaleString("default", { month: "short" })} ${date.getFullYear()}`
          acc[monthYear] = (acc[monthYear] || 0) + 1
          return acc
        }, {})

        const formattedMonthlyData = Object.entries(months)
          .map(([name, count]) => ({
            name,
            count,
          }))
          .sort((a, b) => {
            const [aMonth, aYear] = a.name.split(" ")
            const [bMonth, bYear] = b.name.split(" ")
            return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime()
          })
          .slice(-7) // Last 7 months

        setMonthlyData(formattedMonthlyData)

        // Process ratings data
        const ratings = logs.reduce((acc, log) => {
          const rating = log.rating ? Math.floor(log.rating) : 0
          acc[rating] = (acc[rating] || 0) + 1
          return acc
        }, {})

        const formattedRatingsData = [5, 4, 3, 2, 1].map((rating) => ({
          rating: `${rating} ★`,
          count: ratings[rating] || 0,
        }))

        setRatingsData(formattedRatingsData)
      } catch (error) {
        console.error("Error fetching stats:", error)
        // Fallback to demo data on error
        setCategoryData(DEMO_CATEGORY_DATA)
        setMonthlyData(DEMO_MONTHLY_DATA)
        setRatingsData(DEMO_RATINGS_DATA)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId, isDemoUser, supabase, user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Stats</CardTitle>
          <CardDescription>Loading your flavor statistics...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 rounded-md bg-gray-200 animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="categories">
      <TabsList className="w-full">
        <TabsTrigger value="categories" className="flex-1">
          <PieChart className="h-4 w-4 mr-2" />
          Categories
        </TabsTrigger>
        <TabsTrigger value="activity" className="flex-1">
          <LineChart className="h-4 w-4 mr-2" />
          Activity
        </TabsTrigger>
        <TabsTrigger value="ratings" className="flex-1">
          <BarChart className="h-4 w-4 mr-2" />
          Ratings
        </TabsTrigger>
      </TabsList>

      <TabsContent value="categories" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Flavor Categories</CardTitle>
            <CardDescription>Distribution of flavors by category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} flavors`, "Count"]} />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-2">
              {categoryData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center">
                  <div
                    className="w-3 h-3 rounded-full mr-2"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="text-sm">
                    {entry.name}: {entry.value}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Monthly Activity</CardTitle>
            <CardDescription>Number of flavors logged per month</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsLineChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} flavors`, "Logged"]} />
                  <Line type="monotone" dataKey="count" stroke="#8884d8" activeDot={{ r: 8 }} />
                </RechartsLineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="ratings" className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Ratings Distribution</CardTitle>
            <CardDescription>How you've rated your flavors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={ratingsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="rating" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} flavors`, "Count"]} />
                  <Bar dataKey="count" fill="#8884d8" />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Add default export that references the named export
export default PersonalStats
