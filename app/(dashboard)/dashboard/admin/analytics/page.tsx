import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AppUsageOverview } from "@/components/admin/analytics/app-usage-overview"
import { InstallationMetrics } from "@/components/admin/analytics/installation-metrics"
import { EngagementMetrics } from "@/components/admin/analytics/engagement-metrics"
import { PlatformBreakdown } from "@/components/admin/analytics/platform-breakdown"
import { FeatureUsage } from "@/components/admin/analytics/feature-usage"
import { RetentionChart } from "@/components/admin/analytics/retention-chart"
import { UserActivityHeatmap } from "@/components/admin/analytics/user-activity-heatmap"
import { ExportAnalytics } from "@/components/admin/analytics/export-analytics"
import { UserSegments } from "@/components/admin/analytics/user-segments"
import { RealTimeDashboard } from "@/components/admin/analytics/real-time-dashboard"
import { CustomReports } from "@/components/admin/analytics/custom-reports"
import { ConversionFunnels } from "@/components/admin/analytics/conversion-funnels"

export const metadata: Metadata = {
  title: "App Usage Analytics | ConeDex Admin",
  description: "Detailed analytics about how users are engaging with the ConeDex application",
}

export default function AppUsageAnalyticsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">App Usage Analytics</h1>
        <p className="text-muted-foreground">
          Detailed metrics and insights about how users are engaging with the ConeDex application
        </p>
      </div>

      <RealTimeDashboard />

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="installations">Installations</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="platforms">Platforms</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="retention">Retention</TabsTrigger>
          <TabsTrigger value="funnels">Funnels</TabsTrigger>
          <TabsTrigger value="segments">Segments</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <AppUsageOverview />
        </TabsContent>

        <TabsContent value="installations" className="space-y-4">
          <InstallationMetrics />
        </TabsContent>

        <TabsContent value="engagement" className="space-y-4">
          <EngagementMetrics />
        </TabsContent>

        <TabsContent value="platforms" className="space-y-4">
          <PlatformBreakdown />
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <FeatureUsage />
        </TabsContent>

        <TabsContent value="retention" className="space-y-4">
          <RetentionChart />
          <UserActivityHeatmap />
        </TabsContent>

        <TabsContent value="funnels" className="space-y-4">
          <ConversionFunnels />
        </TabsContent>

        <TabsContent value="segments" className="space-y-4">
          <UserSegments />
        </TabsContent>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <CustomReports />
        <ExportAnalytics />
      </div>
    </div>
  )
}
