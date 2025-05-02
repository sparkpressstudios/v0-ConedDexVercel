"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  Store,
  MapPin,
  Phone,
  Globe,
  Edit,
  PlusCircle,
  IceCream,
  BarChart,
  Loader2,
  Users,
  Star,
  Calendar,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { SubscriptionStatus } from "@/components/subscription/subscription-status"
import { SubscriptionBanner } from "@/components/subscription/subscription-banner"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function ShopDashboardPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [shop, setShop] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [flavors, setFlavors] = useState<any[]>([])
  const [stats, setStats] = useState({
    totalFlavors: 0,
    totalLogs: 0,
    averageRating: 0,
    totalCustomers: 0,
    weeklyVisits: 0,
  })

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return

      setIsLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) {
          if (shopError.code === "PGRST116") {
            // No shop found, redirect to claim page
            router.push("/dashboard/shop/claim")
            return
          }
          throw shopError
        }

        setShop(shopData)

        // Get shop flavors
        const { data: flavorData, error: flavorError } = await supabase
          .from("flavors")
          .select("*")
          .eq("shop_id", shopData.id)
          .order("created_at", { ascending: false })

        if (flavorError) throw flavorError

        setFlavors(flavorData || [])

        // Get shop stats
        const { data: logsData, error: logsError } = await supabase
          .from("flavor_logs")
          .select("rating, user_id")
          .eq("shop_id", shopData.id)

        if (logsError) throw logsError

        // Calculate stats
        const totalLogs = logsData?.length || 0
        const totalRating = logsData?.reduce((sum, log) => sum + (log.rating || 0), 0) || 0
        const averageRating = totalLogs > 0 ? (totalRating / totalLogs).toFixed(1) : "0.0"
        const totalCustomers = new Set(logsData?.map((log) => log.user_id)).size

        // Mock weekly visits data (replace with actual data fetching)
        const weeklyVisits = Math.floor(Math.random() * 50) + 50 // Random number between 50 and 100

        setStats({
          totalFlavors: flavorData?.length || 0,
          totalLogs,
          averageRating: Number.parseFloat(averageRating),
          totalCustomers,
          weeklyVisits,
        })
      } catch (error) {
        console.error("Error fetching shop data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase, router])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
            <CardDescription>You haven't claimed or created a shop yet.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Claim your existing business or create a new listing to get started.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Subscription Banner */}
      <SubscriptionBanner businessId={shop.id} />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{shop.name}</h1>
          <p className="text-muted-foreground">Shop Dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          {shop.is_verified ? (
            <Badge variant="default" className="bg-green-500">
              Verified
            </Badge>
          ) : (
            <Badge variant="outline">Unverified</Badge>
          )}
          <SubscriptionStatus businessId={shop.id} />
          <Button onClick={() => router.push("/dashboard/shop/edit")}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Shop
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Flavors</CardTitle>
            <IceCream className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFlavors}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalFlavors === 0
                ? "Add your first flavor to get started"
                : `You have ${stats.totalFlavors} flavor${stats.totalFlavors === 1 ? "" : "s"} in your menu`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customer Logs</CardTitle>
            <BarChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLogs}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLogs === 0
                ? "No customer logs yet"
                : `${stats.totalLogs} customer${stats.totalLogs === 1 ? "" : "s"} have logged your flavors`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating || "-"}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLogs === 0
                ? "No ratings yet"
                : `Based on ${stats.totalLogs} customer rating${stats.totalLogs === 1 ? "" : "s"}`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalCustomers === 0
                ? "No customers yet"
                : `You have ${stats.totalCustomers} unique customer${stats.totalCustomers === 1 ? "" : "s"}`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Visits</CardTitle>
            <CardDescription>Number of customers who visited this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <div className="text-2xl font-bold">{stats.weeklyVisits}</div>
              <TrendingUp className="ml-2 h-6 w-6 text-green-500" />
            </div>
            <Progress value={(stats.weeklyVisits / 100) * 100} className="mt-4" />
            <p className="mt-2 text-xs text-muted-foreground">
              {stats.weeklyVisits === 0
                ? "No visits this week"
                : `You had ${stats.weeklyVisits} visit${stats.weeklyVisits === 1 ? "" : "s"} this week`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer Engagement</CardTitle>
            <CardDescription>Recent customer activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/shadcn.png" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">shadcn</p>
                    <p className="text-xs text-muted-foreground">Logged Vanilla Bean</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">2 days ago</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Avatar>
                    <AvatarImage src="https://github.com/emilkowalski.png" />
                    <AvatarFallback>EK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">emilkowalski</p>
                    <p className="text-xs text-muted-foreground">Rated Chocolate Fudge</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">1 week ago</p>
                </div>
              </div>
            </div>
            <Button variant="link" className="mt-4 w-full justify-start">
              View All
              <ArrowUpRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Shop Details</CardTitle>
              <CardDescription>Information about your ice cream shop</CardDescription>
            </div>
            <Badge variant={shop.is_verified ? "default" : "outline"}>
              {shop.is_verified ? "Verified" : "Verification Pending"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              {shop.image_url ? (
                <div className="overflow-hidden rounded-md">
                  <img
                    src={shop.image_url || "/placeholder.svg"}
                    alt={shop.name}
                    className="h-64 w-full object-cover"
                  />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
                  <div className="text-center">
                    <Store className="mx-auto h-10 w-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">No shop image</p>
                    <Button variant="link" className="mt-1" onClick={() => router.push("/dashboard/shop/edit")}>
                      Add Image
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Contact Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {shop.address}, {shop.city}, {shop.state}
                    </span>
                  </div>
                  {shop.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{shop.phone}</span>
                    </div>
                  )}
                  {shop.website && (
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {shop.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {shop.description && (
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2 text-muted-foreground">{shop.description}</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="flavors" className="w-full">
        <TabsList>
          <TabsTrigger value="flavors">Flavors</TabsTrigger>
          <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="flavors" className="space-y-4">
          <div className="flex justify-between">
            <h2 className="text-xl font-bold">Your Flavors</h2>
            <Button onClick={() => router.push("/dashboard/shop/flavors/add")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Flavor
            </Button>
          </div>

          {flavors.length === 0 ? (
            <Card>
              <CardContent className="flex h-40 flex-col items-center justify-center p-6 text-center">
                <IceCream className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">You haven't added any flavors yet</p>
                <Button variant="link" onClick={() => router.push("/dashboard/shop/flavors/add")}>
                  Add your first flavor
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {flavors.map((flavor) => (
                <Card key={flavor.id} className="overflow-hidden">
                  {flavor.image_url ? (
                    <div className="aspect-video w-full overflow-hidden">
                      <img
                        src={flavor.image_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex aspect-video w-full items-center justify-center bg-muted">
                      <IceCream className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{flavor.name}</h3>
                      <Badge variant={flavor.is_available ? "default" : "outline"}>
                        {flavor.is_available ? "Available" : "Unavailable"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{flavor.base_type || "Ice Cream"}</p>
                    {flavor.description && <p className="mt-2 text-sm line-clamp-2">{flavor.description}</p>}
                  </CardContent>
                  <CardFooter className="border-t p-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/shop/flavors/${flavor.id}`)}
                    >
                      <Edit className="mr-2 h-4 w-4" />
                      Edit Flavor
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        <TabsContent value="reviews">
          <Card>
            <CardContent className="p-6">
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <BarChart className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Customer reviews will appear here</p>
                <p className="text-sm text-muted-foreground">
                  As customers log your flavors, their reviews will be displayed here
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
