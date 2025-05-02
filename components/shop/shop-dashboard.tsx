"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Store,
  Users,
  IceCream,
  Star,
  TrendingUp,
  Calendar,
  Clock,
  Edit,
  Settings,
  Bell,
  MessageSquare,
  PlusCircle,
} from "lucide-react"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ShopDashboardProps {
  shop: any
  stats: {
    totalCustomers: number
    totalFlavors: number
    averageRating: number
    totalReviews: number
    visitsTrend: any[]
    popularFlavors: any[]
    recentReviews: any[]
    upcomingEvents: any[]
  }
}

export default function ShopDashboard({ shop, stats }: ShopDashboardProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            <AvatarImage src={shop.logo_url || "/placeholder.svg"} alt={shop.name} />
            <AvatarFallback>
              <Store className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{shop.name}</h1>
              {shop.verified && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">
              {shop.address}, {shop.city}, {shop.state}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/shop/edit">
              <Edit className="mr-2 h-4 w-4" />
              Edit Shop
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="/dashboard/shop/settings">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="flavors">Flavors</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">+{Math.floor(Math.random() * 20)}% from last month</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flavors Offered</CardTitle>
                <IceCream className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFlavors}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalFlavors > 10 ? "Great variety!" : "Consider adding more flavors"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < Math.floor(stats.averageRating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-muted-foreground"
                      }`}
                    />
                  ))}
                  <span className="ml-1 text-xs text-muted-foreground">({stats.totalReviews} reviews)</span>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Visits Trend</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">+{Math.floor(Math.random() * 30)}%</div>
                <p className="text-xs text-muted-foreground">Compared to last month</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Visits Over Time</CardTitle>
                <CardDescription>Daily visits for the past 30 days</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ChartContainer
                  config={{
                    visits: {
                      label: "Visits",
                      color: "hsl(var(--chart-1))",
                    },
                  }}
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.visitsTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar dataKey="visits" fill="var(--color-visits)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader>
                <CardTitle>Popular Flavors</CardTitle>
                <CardDescription>Most ordered flavors this month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.popularFlavors.map((flavor, index) => (
                    <div key={index} className="flex items-center gap-4">
                      <div className="relative h-10 w-10 overflow-hidden rounded-md">
                        <img
                          src={flavor.image_url || "/placeholder.svg"}
                          alt={flavor.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{flavor.name}</p>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          <span>{flavor.rating}</span>
                          <span className="mx-1">•</span>
                          <span>{flavor.orders} orders</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium">#{index + 1}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Recent Reviews</CardTitle>
                  <CardDescription>Latest customer feedback</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/dashboard/shop/reviews">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentReviews.map((review, index) => (
                    <div key={index} className="border-b pb-4 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={review.user_avatar || "/placeholder.svg"} alt={review.user_name} />
                          <AvatarFallback>{review.user_name.substring(0, 2)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="font-medium">{review.user_name}</p>
                            <div className="flex items-center">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`h-3 w-3 ${
                                    i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{review.comment}</p>
                          <div className="flex items-center mt-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{review.date}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-1">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Upcoming Events</CardTitle>
                  <CardDescription>Scheduled promotions and events</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add Event
                </Button>
              </CardHeader>
              <CardContent>
                {stats.upcomingEvents.length > 0 ? (
                  <div className="space-y-4">
                    {stats.upcomingEvents.map((event, index) => (
                      <div key={index} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-primary/10">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">{event.date}</p>
                          <p className="text-sm mt-1">{event.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <Calendar className="mx-auto h-10 w-10 text-muted-foreground/50" />
                      <h3 className="mt-2 text-lg font-medium">No upcoming events</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Create an event to attract more customers</p>
                      <Button className="mt-4">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Create Event
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="flavors" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Flavor Menu</h2>
            <Button asChild>
              <Link href="/dashboard/shop/flavors/add">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Flavor
              </Link>
            </Button>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stats.popularFlavors.map((flavor, index) => (
              <Card key={index} className="overflow-hidden">
                <div className="aspect-video bg-muted relative">
                  <img
                    src={flavor.image_url || "/placeholder.svg"}
                    alt={flavor.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant="secondary">{flavor.category}</Badge>
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{flavor.name}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <p className="text-sm text-muted-foreground line-clamp-2">{flavor.description}</p>
                  <div className="flex items-center mt-2">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="font-medium">{flavor.rating}</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{flavor.orders} orders</span>
                  </div>
                </CardContent>
                <div className="px-6 pb-4 pt-0 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" asChild>
                    <Link href={`/dashboard/shop/flavors/${flavor.id}`}>Edit</Link>
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <Bell className="h-4 w-4 mr-1" />
                    Promote
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Customer Reviews</h2>
              <p className="text-muted-foreground">Manage and respond to customer feedback</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                {stats.averageRating.toFixed(1)} overall
              </Badge>
              <Badge variant="outline">{stats.totalReviews} reviews</Badge>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-6">
              {stats.recentReviews.map((review, index) => (
                <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                  <div className="flex items-start gap-4">
                    <Avatar>
                      <AvatarImage src={review.user_avatar || "/placeholder.svg"} alt={review.user_name} />
                      <AvatarFallback>{review.user_name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{review.user_name}</p>
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{review.date}</span>
                            {review.flavor && (
                              <>
                                <span className="mx-1">•</span>
                                <IceCream className="h-3 w-3 mr-1" />
                                <span>{review.flavor}</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="mt-2">{review.comment}</p>
                      {review.photo_url && (
                        <img
                          src={review.photo_url || "/placeholder.svg"}
                          alt="Review"
                          className="mt-3 rounded-md max-h-48 object-cover"
                        />
                      )}
                      <div className="mt-4 flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <MessageSquare className="h-4 w-4 mr-1" />
                          Reply
                        </Button>
                        <Button variant="ghost" size="sm">
                          Report
                        </Button>
                      </div>
                      {review.reply && (
                        <div className="mt-4 pl-4 border-l-2 border-muted">
                          <p className="font-medium">Your response:</p>
                          <p className="text-sm mt-1">{review.reply}</p>
                          <p className="text-xs text-muted-foreground mt-1">{review.reply_date}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Customer Management</h2>
              <p className="text-muted-foreground">View and manage your customer relationships</p>
            </div>
            <Button variant="outline">
              <Users className="h-4 w-4 mr-1" />
              Export Customer List
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Insights</CardTitle>
              <CardDescription>Understand your customer base better</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Returning Customers</p>
                <p className="text-3xl font-bold">{Math.floor(stats.totalCustomers * 0.65)}</p>
                <p className="text-sm text-muted-foreground">
                  {Math.floor((stats.totalCustomers * 0.65 * 100) / stats.totalCustomers)}% of total
                </p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">New Customers</p>
                <p className="text-3xl font-bold">{Math.floor(stats.totalCustomers * 0.35)}</p>
                <p className="text-sm text-muted-foreground">Last 30 days</p>
              </div>
              <div className="rounded-lg bg-muted p-4">
                <p className="text-sm font-medium">Average Visits</p>
                <p className="text-3xl font-bold">2.4</p>
                <p className="text-sm text-muted-foreground">Per customer per month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Loyalty Program</CardTitle>
              <CardDescription>Reward your most loyal customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-[200px] items-center justify-center rounded-md border border-dashed">
                <div className="text-center">
                  <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                  <h3 className="mt-2 text-lg font-medium">No loyalty program set up</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create a loyalty program to increase customer retention
                  </p>
                  <Button className="mt-4">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Set Up Loyalty Program
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
