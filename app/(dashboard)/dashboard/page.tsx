import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Skeleton } from "@/components/ui/skeleton"
import { FeaturedShops } from "@/components/dashboard/featured-shops"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { ExploreShopsBanner } from "@/components/dashboard/explore-shops-banner"
import { LeaderboardWidget } from "@/components/dashboard/leaderboard-widget"
import { QuestProgressWidget } from "@/components/dashboard/quest-progress-widget"
import { CommunityActivityFeed } from "@/components/dashboard/community-activity-feed"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please sign in to view your dashboard</p>
      </div>
    )
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  try {
    return (
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground">
            Welcome back, {profile?.display_name || profile?.username || "Explorer"}!
          </p>
        </div>

        <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
          <QuickActions />
        </Suspense>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <QuestProgressWidget />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <LeaderboardWidget />
          </Suspense>

          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <CommunityActivityFeed />
          </Suspense>
        </div>

        <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
          <FeaturedShops />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
          <ExploreShopsBanner />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="space-y-6">
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            <CardDescription>
              We encountered an issue loading your dashboard. This might be due to missing environment variables or a
              connection issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please make sure the following environment variables are set:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}
