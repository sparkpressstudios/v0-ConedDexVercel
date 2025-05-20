"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { BarChart, LineChart, PieChart, ArrowUpRight, ArrowDownRight, Users, IceCream, MapPin } from "lucide-react"

interface ShopAnalyticsSummaryProps {
  shopId: string
}

export function ShopAnalyticsSummary({ shopId }: ShopAnalyticsSummaryProps) {
  // This is a placeholder component - in a real implementation, you would fetch actual analytics data

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Check-ins</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12.5%
              </span>{" "}
              from last month
            </p>
            <div className="mt-4 h-[80px] w-full bg-neutral-100 rounded-md"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flavor Logs</CardTitle>
            <IceCream className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8.2%
              </span>{" "}
              from last month
            </p>
            <div className="mt-4 h-[80px] w-full bg-neutral-100 rounded-md"></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">132</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDownRight className="h-3 w-3 mr-1" />
                -3.1%
              </span>{" "}
              from last month
            </p>
            <div className="mt-4 h-[80px] w-full bg-neutral-100 rounded-md"></div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Overview</CardTitle>
          <CardDescription>View your shop's performance metrics over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="traffic">
            <TabsList className="mb-4">
              <TabsTrigger value="traffic">Traffic</TabsTrigger>
              <TabsTrigger value="flavors">Flavors</TabsTrigger>
              <TabsTrigger value="demographics">Demographics</TabsTrigger>
            </TabsList>
            <TabsContent value="traffic" className="space-y-4">
              <div className="h-[300px] w-full bg-neutral-100 rounded-md flex items-center justify-center">
                <LineChart className="h-8 w-8 text-neutral-400" />
              </div>
            </TabsContent>
            <TabsContent value="flavors" className="space-y-4">
              <div className="h-[300px] w-full bg-neutral-100 rounded-md flex items-center justify-center">
                <BarChart className="h-8 w-8 text-neutral-400" />
              </div>
            </TabsContent>
            <TabsContent value="demographics" className="space-y-4">
              <div className="h-[300px] w-full bg-neutral-100 rounded-md flex items-center justify-center">
                <PieChart className="h-8 w-8 text-neutral-400" />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button asChild>
          <a href="/dashboard/shop/analytics">View Detailed Analytics</a>
        </Button>
      </div>
    </div>
  )
}
