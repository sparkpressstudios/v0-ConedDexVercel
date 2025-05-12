export const dynamic = "force-dynamic"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, MapPin, Award, PlusCircle, TrendingUp, Star, Clock } from "lucide-react"
import Link from "next/link"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import { Suspense } from "react"
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Database } from "@/lib/database.types"

export default async function DashboardPage() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Get user profile
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

    // Get flavor logs count
    const { count: flavorLogsCount } = await supabase
      .from("flavor_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)

    // Get badges count
    const { count: badgesCount } = await supabase
      .from("user_badges")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user?.id)

    // Get recent flavor logs
    const { data: recentLogs } = await supabase
      .from("flavor_logs")
      .select(`
        *,
        flavors:flavor_id (name, base_type, image_url, category, rarity),
        shops:shop_id (name, id)
      `)
      .eq("user_id", user?.id)
      .order("created_at", { ascending: false })
      .limit(5)

    // Get shops visited count
    const { data: shopsVisited } = await supabase
      .from("flavor_logs")
      .select("shop_id")
      .eq("user_id", user?.id)
      .limit(1000)

    const uniqueShops = shopsVisited ? [...new Set(shopsVisited.map((log) => log.shop_id))].length : 0

    const isExplorer = profile?.role === "explorer"
    const isShopOwner = profile?.role === "shop_owner"

    // Calculate progress to next badge
    const nextBadgeProgress = Math.min(Math.floor((flavorLogsCount || 0) % 10) * 10, 100)

    // Get user's rank if available
    const { data: userRank } = await supabase.rpc("get_user_rank", { user_id: user?.id })
    const rank = userRank?.[0]?.rank || "—"

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
              {isExplorer && (
                <Button asChild variant="secondary" className="bg-white text-purple-700 hover:bg-white/90">
                  <Link href="/dashboard/log-flavor">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Log New Flavor
                  </Link>
                </Button>
              )}
              {isShopOwner && (
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

        {/* Stats Section */}
        <ErrorBoundary>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-pink-50 to-pink-100">
                <CardTitle className="text-sm font-medium">Flavors Logged</CardTitle>
                <IceCream className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-pink-600">{flavorLogsCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {flavorLogsCount === 0
                    ? "Start logging your ice cream adventures!"
                    : `You've logged ${flavorLogsCount} flavor${flavorLogsCount === 1 ? "" : "s"} so far`}
                </p>
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span>Progress to next badge</span>
                    <span className="font-medium">{nextBadgeProgress}%</span>
                  </div>
                  <Progress value={nextBadgeProgress} className="h-1.5" indicatorClassName="bg-pink-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                <CardTitle className="text-sm font-medium">Shops Visited</CardTitle>
                <MapPin className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-blue-600">{uniqueShops}</div>
                <p className="text-xs text-muted-foreground mt-1">Unique ice cream shops visited</p>
                <div className="mt-3 flex items-center text-xs text-blue-600">
                  <TrendingUp className="h-3.5 w-3.5 mr-1" />
                  <span>Explore more shops to earn badges</span>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-amber-50 to-amber-100">
                <CardTitle className="text-sm font-medium">Badges Earned</CardTitle>
                <Award className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-amber-600">{badgesCount || 0}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {badgesCount === 0
                    ? "Complete challenges to earn badges!"
                    : `You've earned ${badgesCount} badge${badgesCount === 1 ? "" : "s"}`}
                </p>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                  >
                    <Link href="/dashboard/badges">View All Badges</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-green-50 to-green-100">
                <CardTitle className="text-sm font-medium">Leaderboard Rank</CardTitle>
                <Star className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-bold text-green-600">#{rank}</div>
                <p className="text-xs text-muted-foreground mt-1">Your current position on the leaderboard</p>
                <div className="mt-3">
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="h-7 px-2 text-xs text-green-600 hover:text-green-700 hover:bg-green-50"
                  >
                    <Link href="/dashboard/leaderboard">View Leaderboard</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </ErrorBoundary>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Recent Activity */}
          <ErrorBoundary>
            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>Your latest ice cream adventures</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-xs">
                    <Link href="/dashboard/flavors">View All</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {recentLogs && recentLogs.length > 0 ? (
                  <div className="space-y-5">
                    {recentLogs.map((log) => (
                      <div key={log.id} className="flex items-center gap-4 group">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md">
                          <img
                            src={
                              log.flavors?.image_url ||
                              log.photo_url ||
                              "/placeholder.svg?height=100&width=100&query=ice cream scoop" ||
                              "/placeholder.svg" ||
                              "/placeholder.svg"
                            }
                            alt={log.flavors?.name || "Ice cream"}
                            className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium truncate">{log.flavors?.name || "Unknown Flavor"}</h3>
                            {log.flavors?.rarity && (
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                {log.flavors.rarity}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center text-sm text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span className="truncate">{log.shops?.name || "Unknown Shop"}</span>
                            <span className="mx-1.5 h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                            <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                            <span>{new Date(log.visit_date || log.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-pink-600 font-medium">
                          {log.rating || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-lg border border-dashed">
                    <div className="text-center">
                      <IceCream className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground">No flavor logs yet</p>
                      <Button asChild variant="link" className="mt-2">
                        <Link href="/dashboard/log-flavor">Log your first flavor</Link>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </ErrorBoundary>

          {/* Leaderboard Widget */}
          <Card className="md:col-span-1">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Leaderboard</CardTitle>
                  <CardDescription>Top ice cream explorers</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild className="text-xs">
                  <Link href="/dashboard/leaderboard">View All</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
                <LeaderboardWidget />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Dashboard page error:", error)
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Something went wrong</h2>
          <p className="mt-2 text-muted-foreground">We're having trouble loading your dashboard.</p>
          <Button asChild variant="default" className="mt-4">
            <Link href="/dashboard">Try Again</Link>
          </Button>
        </div>
      </div>
    )
  }
}
