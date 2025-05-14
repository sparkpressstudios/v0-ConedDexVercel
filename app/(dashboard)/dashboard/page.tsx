export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, MapPin, Award, PlusCircle, Star } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/lib/database.types"
import { getDemoUser } from "@/lib/auth/session"
import { Shell } from "@/components/shell"

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

  // Simplified dashboard with just the welcome section
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
              <Button asChild variant="secondary" className="bg-white text-purple-700 hover:bg-white/90">
                <Link href="/dashboard/log-flavor">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Log New Flavor
                </Link>
              </Button>
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
