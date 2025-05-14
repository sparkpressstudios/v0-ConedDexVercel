export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, MapPin, Award, Star, Compass, TrendingUp, Users } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/lib/database.types"
import { getDemoUser } from "@/lib/auth/session"
import { Shell } from "@/components/shell"
import { LogFlavorButton } from "@/components/flavor/log-flavor-button"
import Image from "next/image"

export default async function DashboardPage() {
  try {
    // Check for demo user first
    const demoUser = getDemoUser()

    // If we have a demo user, render a simplified dashboard
    if (demoUser) {
      return renderDashboardForUser({
        id: demoUser.id,
        role: demoUser.role,
        username: demoUser.email.split("@")[0],
        full_name: demoUser.name,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.name.replace(" ", "")}`,
      })
    }

    // Try to get the Supabase client
    let supabase
    try {
      supabase = createServerComponentClient<Database>({ cookies })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return renderErrorState("Failed to initialize database connection")
    }

    // Try to get the user
    let user
    try {
      const { data, error } = await supabase.auth.getUser()
      if (error) throw error
      user = data.user
    } catch (error) {
      console.error("Failed to get user:", error)
      return renderErrorState("Authentication error")
    }

    // If no user, render the error state
    if (!user) {
      return renderErrorState("User not authenticated")
    }

    // Try to get the user profile
    let profile
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (error) throw error
      profile = data
    } catch (error) {
      console.error("Failed to get profile:", error)

      // Create a basic profile if we couldn't get one
      profile = {
        id: user.id,
        role: "explorer",
        username: user.email?.split("@")[0] || "User",
        full_name: user.email?.split("@")[0] || "User",
        avatar_url: null,
      }
    }

    return renderDashboardForUser(profile)
  } catch (error) {
    console.error("Dashboard page error:", error)
    return renderErrorState("Unexpected error")
  }
}

// Helper function to render the dashboard for a user
function renderDashboardForUser(profile: any) {
  const userRole = profile.role || "explorer"
  const isExplorer = userRole === "explorer"
  const isShopOwner = userRole === "shop_owner"
  const isAdmin = userRole === "admin"

  // Explorer-themed dashboard with vibrant colors
  if (isExplorer) {
    return (
      <div className="space-y-8">
        {/* Explorer Hero Section with Original Design */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-strawberry-400 via-mint-400 to-blueberry-400 p-8 text-white shadow-lg">
          <div className="absolute inset-0 bg-black/5"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/50">
                <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username || "User"} />
                <AvatarFallback className="bg-white/20 text-white">
                  {profile?.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">
                  Welcome back, {profile?.full_name || profile?.username || "Ice Cream Explorer"}!
                </h1>
                <p className="mt-1 text-white/80">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <LogFlavorButton variant="secondary" className="bg-white text-strawberry-500 hover:bg-white/90" />
              <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/shops">
                  <MapPin className="mr-2 h-4 w-4" />
                  Find Shops
                </Link>
              </Button>
            </div>
          </div>

          {/* Decorative ice cream cone illustration */}
          <div className="absolute -bottom-10 right-10 h-32 w-32 opacity-20">
            <Image
              src="/colorful-ice-cream-cones.png"
              alt="Ice Cream Cones"
              width={128}
              height={128}
              className="object-contain"
            />
          </div>

          <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        </div>

        {/* Explorer Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-strawberry-50 to-white border-strawberry-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-strawberry-700">Flavors Logged</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-strawberry-600">12</div>
                <IceCream className="h-5 w-5 text-strawberry-400" />
              </div>
              <p className="mt-2 text-xs text-strawberry-600/80">3 new this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-mint-50 to-white border-mint-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-mint-700">Shops Visited</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-mint-600">8</div>
                <MapPin className="h-5 w-5 text-mint-400" />
              </div>
              <p className="mt-2 text-xs text-mint-600/80">1 new this week</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blueberry-50 to-white border-blueberry-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blueberry-700">Badges Earned</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-blueberry-600">5</div>
                <Award className="h-5 w-5 text-blueberry-400" />
              </div>
              <p className="mt-2 text-xs text-blueberry-600/80">New badge available!</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-vanilla-50 to-white border-vanilla-100">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-vanilla-800">Leaderboard Rank</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-2xl font-bold text-vanilla-700">#42</div>
                <TrendingUp className="h-5 w-5 text-vanilla-500" />
              </div>
              <p className="mt-2 text-xs text-vanilla-700/80">Up 3 spots this week</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card className="border-strawberry-100 hover:border-strawberry-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-strawberry-700">Explore Flavors</CardTitle>
              <IceCream className="h-4 w-4 text-strawberry-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="default" className="w-full bg-strawberry-500 hover:bg-strawberry-600">
                <Link href="/dashboard/conedex">Browse ConeDex</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-mint-100 hover:border-mint-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-mint-700">Find Shops</CardTitle>
              <MapPin className="h-4 w-4 text-mint-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="default" className="w-full bg-mint-500 hover:bg-mint-600">
                <Link href="/dashboard/shops">Discover Shops</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-blueberry-100 hover:border-blueberry-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blueberry-700">View Leaderboard</CardTitle>
              <Award className="h-4 w-4 text-blueberry-500" />
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="default" className="w-full bg-blueberry-500 hover:bg-blueberry-600">
                <Link href="/dashboard/leaderboard">See Rankings</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-vanilla-100 hover:border-vanilla-200 transition-colors">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-vanilla-800">Your Profile</CardTitle>
              <Star className="h-4 w-4 text-vanilla-600" />
            </CardHeader>
            <CardContent className="pt-4">
              <Button asChild variant="default" className="w-full bg-vanilla-500 hover:bg-vanilla-600">
                <Link href="/dashboard/profile">View Profile</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity and Recommendations */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-strawberry-700">
                <Compass className="mr-2 h-5 w-5 text-strawberry-500" />
                Nearby Adventures
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-mint-100 p-2">
                    <MapPin className="h-4 w-4 text-mint-600" />
                  </div>
                  <div>
                    <p className="font-medium">Scoops Ahoy</p>
                    <p className="text-sm text-muted-foreground">0.8 miles away • 24 flavors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-blueberry-100 p-2">
                    <MapPin className="h-4 w-4 text-blueberry-600" />
                  </div>
                  <div>
                    <p className="font-medium">Frozen Delights</p>
                    <p className="text-sm text-muted-foreground">1.2 miles away • 18 flavors</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-strawberry-100 p-2">
                    <MapPin className="h-4 w-4 text-strawberry-600" />
                  </div>
                  <div>
                    <p className="font-medium">Sweet Treats</p>
                    <p className="text-sm text-muted-foreground">1.5 miles away • 30 flavors</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-blueberry-700">
                <Users className="mr-2 h-5 w-5 text-blueberry-500" />
                Community Favorites
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-strawberry-100 p-2">
                    <IceCream className="h-4 w-4 text-strawberry-600" />
                  </div>
                  <div>
                    <p className="font-medium">Strawberry Cheesecake</p>
                    <p className="text-sm text-muted-foreground">Trending this week • 42 logs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-mint-100 p-2">
                    <IceCream className="h-4 w-4 text-mint-600" />
                  </div>
                  <div>
                    <p className="font-medium">Mint Chocolate Chip</p>
                    <p className="text-sm text-muted-foreground">Popular year-round • 38 logs</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="rounded-md bg-chocolate-100 p-2">
                    <IceCream className="h-4 w-4 text-chocolate-600" />
                  </div>
                  <div>
                    <p className="font-medium">Chocolate Fudge Brownie</p>
                    <p className="text-sm text-muted-foreground">Classic favorite • 35 logs</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Shop owner and admin dashboards remain the same
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 p-8 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/50">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username || "User"} />
              <AvatarFallback className="bg-white/20 text-white">
                {profile?.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Welcome back, {profile?.full_name || profile?.username || "Ice Cream Explorer"}!
              </h1>
              <p className="mt-1 text-white/80">
                {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
              </p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            {userRole === "explorer" && (
              <LogFlavorButton variant="secondary" className="bg-white text-purple-700 hover:bg-white/90" />
            )}
            {userRole === "shop_owner" && (
              <Button asChild variant="secondary" className="bg-white text-purple-700 hover:bg-white/90">
                <Link href="/dashboard/shop">
                  <IceCream className="mr-2 h-4 w-4" />
                  Manage Shop
                </Link>
              </Button>
            )}
            <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20">
              <Link href="/dashboard/shops">
                <MapPin className="mr-2 h-4 w-4" />
                Find Shops
              </Link>
            </Button>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
        <div className="absolute -top-8 -left-8 h-32 w-32 rounded-full bg-white/10 blur-3xl"></div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Explore Flavors</CardTitle>
            <IceCream className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/conedex">Browse ConeDex</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Find Shops</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/shops">Discover Shops</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">View Leaderboard</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/leaderboard">See Rankings</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Profile</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="pt-4">
            <Button asChild variant="default" className="w-full">
              <Link href="/dashboard/profile">View Profile</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Helper function to render the error state
function renderErrorState(errorMessage = "We're having trouble loading your dashboard") {
  return (
    <Shell layout="centered">
      <div className="flex flex-col items-center justify-center py-10 text-center">
        <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
          <IceCream className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Dashboard Temporarily Unavailable</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          {errorMessage}. We're working to resolve this issue as quickly as possible.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <Button asChild variant="default" className="w-full">
            <Link href="/dashboard">Refresh Dashboard</Link>
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </Shell>
  )
}
