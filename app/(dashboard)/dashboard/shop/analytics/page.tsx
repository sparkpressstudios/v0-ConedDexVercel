import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2 } from "lucide-react"
import { FeatureGate } from "@/components/subscription/feature-gate"
import { ShopAnalyticsOverview } from "@/components/analytics/shop-analytics-overview"
import { ShopAnalyticsCharts } from "@/components/analytics/shop-analytics-charts"
import { CustomerDemographics } from "@/components/analytics/customer-demographics"
import { FlavorAnalytics } from "@/components/analytics/flavor-analytics"
import { RealtimeAnalytics } from "@/components/analytics/realtime-analytics"
import { getCurrentShop } from "@/app/actions/shop-actions"

export default async function ShopAnalyticsPage() {
  const shop = await getCurrentShop()

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
            <CardDescription>You need to create or claim a shop to view analytics.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shop Analytics</h1>
        <p className="text-muted-foreground mt-2">Track and analyze your shop's performance.</p>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="flavors">Flavors</TabsTrigger>
          <TabsTrigger value="realtime">Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Suspense fallback={<AnalyticsLoadingSkeleton />}>
            <ShopAnalyticsOverview shopId={shop.id} />
          </Suspense>

          <Suspense fallback={<ChartLoadingSkeleton title="Monthly Metrics" />}>
            <ShopAnalyticsCharts shopId={shop.id} />
          </Suspense>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <FeatureGate
            businessId={shop.id}
            featureKey="advanced_customer_insights"
            title="Advanced Customer Insights"
            description="Detailed customer analytics and segmentation requires a higher subscription tier."
          >
            <Suspense fallback={<AnalyticsLoadingSkeleton />}>
              <CustomerDemographics shopId={shop.id} />
            </Suspense>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="flavors" className="space-y-4">
          <FeatureGate
            businessId={shop.id}
            featureKey="advanced_flavor_analytics"
            title="Advanced Flavor Analytics"
            description="Detailed flavor popularity analytics requires a higher subscription tier."
          >
            <Suspense fallback={<AnalyticsLoadingSkeleton />}>
              <FlavorAnalytics shopId={shop.id} />
            </Suspense>
          </FeatureGate>
        </TabsContent>

        <TabsContent value="realtime" className="space-y-4">
          <FeatureGate
            businessId={shop.id}
            featureKey="realtime_analytics"
            title="Real-time Analytics"
            description="Real-time analytics requires a premium subscription tier."
          >
            <RealtimeAnalytics shopId={shop.id} />
          </FeatureGate>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function AnalyticsLoadingSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="h-5 w-24 bg-muted rounded animate-pulse"></div>
            <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
          </CardHeader>
          <CardContent>
            <div className="h-7 w-16 bg-muted rounded animate-pulse mb-1"></div>
            <div className="h-4 w-32 bg-muted rounded animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function ChartLoadingSkeleton({ title }: { title: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Loading data...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] flex items-center justify-center bg-muted/20 animate-pulse">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )
}
