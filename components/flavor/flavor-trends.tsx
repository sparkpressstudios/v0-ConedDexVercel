"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
} from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

// Sample data - in a real app, this would come from an API
const flavorTrendData = [
  { month: "Jan", chocolate: 65, vanilla: 40, strawberry: 35, mint: 28 },
  { month: "Feb", chocolate: 59, vanilla: 42, strawberry: 31, mint: 33 },
  { month: "Mar", chocolate: 80, vanilla: 52, strawberry: 29, mint: 38 },
  { month: "Apr", chocolate: 81, vanilla: 54, strawberry: 47, mint: 42 },
  { month: "May", chocolate: 56, vanilla: 48, strawberry: 65, mint: 35 },
  { month: "Jun", chocolate: 55, vanilla: 42, strawberry: 70, mint: 30 },
  { month: "Jul", chocolate: 40, vanilla: 38, strawberry: 65, mint: 43 },
  { month: "Aug", chocolate: 45, vanilla: 40, strawberry: 55, mint: 55 },
]

const seasonalTrendData = [
  { name: "Winter", chocolate: 75, vanilla: 45, strawberry: 25, mint: 60 },
  { name: "Spring", chocolate: 65, vanilla: 55, strawberry: 60, mint: 45 },
  { name: "Summer", chocolate: 45, vanilla: 60, strawberry: 80, mint: 70 },
  { name: "Fall", chocolate: 70, vanilla: 50, strawberry: 40, mint: 35 },
]

export default function FlavorTrends() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [timeRange, setTimeRange] = useState("6m")

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Flavor Trends</CardTitle>
            <CardDescription>Track popularity of flavors over time</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1m">Last Month</SelectItem>
                <SelectItem value="3m">Last 3 Months</SelectItem>
                <SelectItem value="6m">Last 6 Months</SelectItem>
                <SelectItem value="1y">Last Year</SelectItem>
              </SelectContent>
            </Select>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[140px] justify-start text-left font-normal">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="line">
          <TabsList className="mb-4">
            <TabsTrigger value="line">Line Chart</TabsTrigger>
            <TabsTrigger value="bar">Bar Chart</TabsTrigger>
            <TabsTrigger value="seasonal">Seasonal</TabsTrigger>
          </TabsList>

          <TabsContent value="line" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={flavorTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="chocolate" stroke="#8B4513" strokeWidth={2} />
                <Line type="monotone" dataKey="vanilla" stroke="#F3E5AB" strokeWidth={2} />
                <Line type="monotone" dataKey="strawberry" stroke="#FF69B4" strokeWidth={2} />
                <Line type="monotone" dataKey="mint" stroke="#98FB98" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="bar" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={flavorTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="chocolate" fill="#8B4513" />
                <Bar dataKey="vanilla" fill="#F3E5AB" />
                <Bar dataKey="strawberry" fill="#FF69B4" />
                <Bar dataKey="mint" fill="#98FB98" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>

          <TabsContent value="seasonal" className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={seasonalTrendData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="chocolate" fill="#8B4513" />
                <Bar dataKey="vanilla" fill="#F3E5AB" />
                <Bar dataKey="strawberry" fill="#FF69B4" />
                <Bar dataKey="mint" fill="#98FB98" />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
