export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, Users, Award, Bell, TrendingUp, Star, BarChart, Megaphone, Settings } from "lucide-react"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/lib/database.types"
import { redirect } from "next/navigation"

export default async function ShopDashboardPage() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return redirect("/login")
    }

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

    if (!profile) {
      return redirect("/login")
    }

    const userRole = profile.role || "explorer"

    // Only shop owners and admins can access this page
    if (userRole !== "shop_owner" && userRole !== "admin") {
      return redirect("/dashboard")
    }

    // Get shop data
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("*, shop_stats(*)")
      .eq("owner_id", user.id)
      .single()

    // If no shop is found, redirect to claim shop page
    if (shopError || !shop) {
      return redirect("/dashboard/shop/claim")
    }

    // Get shop stats
    const totalFlavors = shop.shop_stats?.total_flavors || 0
    const totalReviews = shop.shop_stats?.total_reviews || 0
    const averageRating = shop.shop_stats?.average_rating || 0
    const totalFollowers = shop.shop_stats?.total_followers || 0

    // Get recent announcements
    const { data: recentAnnouncements } = await supabase
      .from("shop_announcements")
      .select("*")
      .eq("shop_id", shop.id)
      .order("created_at", { ascending: false })
      .limit(3)

    return (
      <div className="space-y-8">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-500 via-teal-500 to-emerald-500 p-8 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/50">
                <AvatarImage src={shop.logo_url || "/placeholder.svg"} alt={shop.name || "Shop"} />
                <AvatarFallback className="bg-white/20 text-white">
                  {shop.name?.substring(0, 2).toUpperCase() || "S"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">{shop.name || "Your Shop"}</h1>
                <p className="mt-1 text-white/80">Shop Owner Dashboard</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-white text-teal-700 hover:bg-white/90">
                <Link href="/dashboard/shop/flavors">
                  <IceCream className="mr-2 h-4 w-4" />
                  Manage Flavors
                </Link>
              </Button>
              <Button asChild variant="secondary" className="bg-white text-teal-700 hover:bg-white/90">
                <Link href="/dashboard/shop/announcements">
                  <Bell className="mr-2 h-4 w-4" />
                  Post Announcement
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/shop/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  Shop Settings
                </Link>
              </Button>
            </div>
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        {/* Stats Section */}
        <ErrorBoundary>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-teal-50 to-teal-100">
                <CardTitle className="text-sm font-medium">Total Flavors</CardTitle>
                <IceCream className="h-4 w-4 text-teal-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-teal-600">{totalFlavors}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalFlavors === 0
                    ? "Add your first flavor!"
                    : `You have ${totalFlavors} flavor${totalFlavors === 1 ? "" : "s"} in your shop`}
                </p>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs text-teal-600 hover:text-teal-700 hover:bg-teal-50"
                  >
                    <Link href="/dashboard/shop/flavors">Manage Flavors</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-sm font-medium">Customer Reviews</CardTitle>
                <Star className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">{totalReviews}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalReviews === 0 ? "No reviews yet" : `Average rating: ${averageRating.toFixed(1)}/5`}
                </p>
                <div className="mt-3 flex items-center text-xs text-blue-600">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>Encourage customers to leave reviews</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-sm font-medium">Followers</CardTitle>
                <Users className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-amber-600">{totalFollowers}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {totalFollowers === 0
                    ? "No followers yet"
                    : `${totalFollowers} customer${totalFollowers === 1 ? "" : "s"} following your shop`}
                </p>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Link href="/dashboard/shop/marketing">Grow Your Audience</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-purple-50 to-purple-100">
                <CardTitle className="text-sm font-medium">Shop Status</CardTitle>
                <Award className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-purple-600">{shop.is_verified ? "Verified" : "Pending"}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {shop.is_verified ? "Your shop is verified" : "Verification in progress"}
                </p>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                  >
                    <Link href="/dashboard/shop/settings">View Status</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ErrorBoundary>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your shop</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/shop/flavors/add">
                  <IceCream className="mr-2 h-4 w-4" />
                  Add New Flavor
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/shop/announcements/new">
                  <Bell className="mr-2 h-4 w-4" />
                  Create Announcement
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/shop/analytics">
                  <BarChart className="mr-2 h-4 w-4" />
                  View Analytics
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start" size="sm">
                <Link href="/dashboard/shop/marketing">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Marketing Tools
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <Card className="md:col-span-2">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recent Announcements</CardTitle>
                  <CardDescription>Updates you've shared with customers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/dashboard/shop/announcements">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentAnnouncements && recentAnnouncements.length > 0 ? (
                <div className="space-y-4">
                  {recentAnnouncements.map((announcement) => (
                    <div key={announcement.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">{announcement.title}</h3>
                        <Badge variant={announcement.is_active ? "default" : "outline"}>
                          {announcement.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>Posted: {new Date(announcement.created_at).toLocaleDateString()}</span>
                        {announcement.expiry_date && (
                          <span>Expires: {new Date(announcement.expiry_date).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">No announcements yet</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/dashboard/shop/announcements/new">Create your first announcement</Link>
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Shop dashboard page error:", error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">We're having trouble loading your shop dashboard.</p>
          <Button asChild variant="default" className="mt-4">
            <Link href="/dashboard/shop">Try Again</Link>
          </Button>
        </div>
      </div>
    )
  }
}
