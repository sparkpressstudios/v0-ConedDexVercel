"use client"

import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { FeaturedShops } from "@/components/dashboard/featured-shops"
import { ExploreShopsBanner } from "@/components/dashboard/explore-shops-banner"
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget"
import { QuestProgressWidget } from "@/components/dashboard/quest-progress-widget"
import { CommunityActivityFeed } from "@/components/dashboard/community-activity-feed"
import { ImprovedQuickActions } from "@/components/dashboard/improved-quick-actions"
import { RecentActivity } from "@/components/dashboard/recent-activity"
import { NearbyShopsWidget } from "@/components/dashboard/nearby-shops-widget"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, IceCream, Compass } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

interface DashboardClientProps {
  profile: any
  userRole: string
  recentCheckIns: any[]
  recentFlavors: any[]
  userId: string
}

export function DashboardClient({ profile, userRole, recentCheckIns, recentFlavors, userId }: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || profile?.username || "Explorer"}!
          </p>
        </div>

        {userRole === "shop_owner" && (
          <Button asChild size="sm" className="sm:self-start">
            <Link href="/dashboard/shop">Go to Shop Dashboard</Link>
          </Button>
        )}

        {userRole === "admin" && (
          <Button asChild size="sm" className="sm:self-start">
            <Link href="/dashboard/admin">Go to Admin Dashboard</Link>
          </Button>
        )}
      </div>

      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <ImprovedQuickActions userRole={userRole} />
      </Suspense>

      <Tabs defaultValue="overview" className="w-full" onValueChange={setActiveTab} value={activeTab}>
        <TabsList className="w-full sm:w-auto mb-2">
          <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
            Overview
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 sm:flex-initial">
            Activity
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex-1 sm:flex-initial">
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Recent Activity Summary Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Recent Check-ins Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <MapPin className="mr-2 h-5 w-5 text-primary" />
                  Recent Check-ins
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentCheckIns && recentCheckIns.length > 0 ? (
                  <ul className="space-y-2">
                    {recentCheckIns.map((checkIn) => (
                      <li key={checkIn.id} className="flex items-start space-x-2 text-sm">
                        <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{checkIn.shops?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {checkIn.shops?.city}, {checkIn.shops?.state}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No recent check-ins</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/dashboard/explore-shops">Find Shops</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Recent Flavors Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <IceCream className="mr-2 h-5 w-5 text-primary" />
                  Recent Flavors
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentFlavors && recentFlavors.length > 0 ? (
                  <ul className="space-y-2">
                    {recentFlavors.map((flavor) => (
                      <li key={flavor.id} className="flex items-start space-x-2 text-sm">
                        <IceCream className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{flavor.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {flavor.shops?.name} • Rating: {flavor.rating}/10
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No flavors logged yet</p>
                )}
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/dashboard/log-flavor">Log New Flavor</Link>
                </Button>
              </CardFooter>
            </Card>

            {/* Active Quests Card */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center text-lg">
                  <Compass className="mr-2 h-5 w-5 text-primary" />
                  Active Quests
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
                  <QuestProgressWidget compact />
                </Suspense>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link href="/dashboard/quests">View All Quests</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <NearbyShopsWidget />
            </Suspense>

            <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
              <LeaderboardWidget />
            </Suspense>
          </div>

          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <CommunityActivityFeed />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <RecentActivity userId={userId} />
          </Suspense>
        </TabsContent>

        <TabsContent value="discover" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <FeaturedShops />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
            <ExploreShopsBanner />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
