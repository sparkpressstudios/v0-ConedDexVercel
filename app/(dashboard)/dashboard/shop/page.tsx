import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ShopDashboardHeader } from "@/components/shop/shop-dashboard-header"
import { ShopQuickActions } from "@/components/shop/shop-quick-actions"
import { ShopAnalyticsSummary } from "@/components/shop/shop-analytics-summary"
import { ShopRecentActivity } from "@/components/shop/shop-recent-activity"
import { ShopFlavorsOverview } from "@/components/shop/shop-flavors-overview"
import { ShopCustomerInsights } from "@/components/shop/shop-customer-insights"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ShopDashboardPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect("/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Check if user is a shop owner
  if (profile?.role !== "shop_owner") {
    return redirect("/dashboard")
  }

  // Get user's shop
  const { data: shop } = await supabase.from("shops").select("*").eq("owner_id", user.id).single()

  if (!shop) {
    return (
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">Shop Dashboard</h2>
        <Card>
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
            <CardDescription>
              You don't have a shop yet. Claim or create a shop to access the shop dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col sm:flex-row gap-4">
            <Button asChild>
              <Link href="/dashboard/shop/claim">Claim a Shop</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/dashboard/shop/create">Create a Shop</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Suspense fallback={<Skeleton className="h-[200px] w-full" />}>
        <ShopDashboardHeader shop={shop} />
      </Suspense>

      <Suspense fallback={<Skeleton className="h-[100px] w-full" />}>
        <ShopQuickActions shop={shop} />
      </Suspense>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="w-full sm:w-auto mb-2">
          <TabsTrigger value="overview" className="flex-1 sm:flex-initial">
            Overview
          </TabsTrigger>
          <TabsTrigger value="flavors" className="flex-1 sm:flex-initial">
            Flavors
          </TabsTrigger>
          <TabsTrigger value="customers" className="flex-1 sm:flex-initial">
            Customers
          </TabsTrigger>
          <TabsTrigger value="activity" className="flex-1 sm:flex-initial">
            Activity
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
            <ShopAnalyticsSummary shopId={shop.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="flavors" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ShopFlavorsOverview shopId={shop.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ShopCustomerInsights shopId={shop.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="activity" className="space-y-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <ShopRecentActivity shopId={shop.id} />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
