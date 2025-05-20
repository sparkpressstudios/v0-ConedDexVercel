"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { PieChart, BarChart, Users, MapPin } from "lucide-react"

interface ShopCustomerInsightsProps {
  shopId: string
}

export function ShopCustomerInsights({ shopId }: ShopCustomerInsightsProps) {
  // This is a placeholder component - in a real implementation, you would fetch actual customer data

  const mockCustomers = [
    {
      id: "1",
      name: "Alex Johnson",
      username: "alexj",
      avatar: null,
      visits: 12,
      last_visit: "2 days ago",
      favorite_flavor: "Vanilla Bean",
    },
    {
      id: "2",
      name: "Sam Smith",
      username: "samsmith",
      avatar: null,
      visits: 8,
      last_visit: "1 week ago",
      favorite_flavor: "Chocolate Fudge",
    },
    {
      id: "3",
      name: "Taylor Wilson",
      username: "taylorw",
      avatar: null,
      visits: 15,
      last_visit: "3 days ago",
      favorite_flavor: "Strawberry Swirl",
    },
    {
      id: "4",
      name: "Jordan Lee",
      username: "jlee",
      avatar: null,
      visits: 5,
      last_visit: "2 weeks ago",
      favorite_flavor: "Mint Chocolate Chip",
    },
    {
      id: "5",
      name: "Casey Morgan",
      username: "cmorgan",
      avatar: null,
      visits: 10,
      last_visit: "5 days ago",
      favorite_flavor: "Cookies and Cream",
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Customer Insights</CardTitle>
        <CardDescription>Understand your customer base and their preferences</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultvalue="overview" className="w-[400px]">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="locations">Locations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Sales by Flavor</CardTitle>
                  <CardDescription>A breakdown of sales by ice cream flavor</CardDescription>
                </CardHeader>
                <CardContent>
                  <PieChart className="h-32 w-32" />
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Sales Over Time</CardTitle>
                  <CardDescription>A breakdown of sales over the past week</CardDescription>
                </CardHeader>
                <CardContent>
                  <BarChart className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="customers">
            <div className="grid gap-4">
              {mockCustomers.map((customer) => (
                <Card key={customer.id}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      <Avatar className="mr-2 h-8 w-8">
                        <AvatarImage src={`https://avatar.vercel.sh/${customer.username}.png`} />
                        <AvatarFallback>{customer.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      {customer.name}
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Last visit: {customer.last_visit}
                      <br />
                      Favorite flavor: {customer.favorite_flavor}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="locations">
            <Card>
              <CardHeader>
                <CardTitle>Customer Locations</CardTitle>
                <CardDescription>A map of where your customers are located</CardDescription>
              </CardHeader>
              <CardContent>
                <MapPin className="h-32 w-32" />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
