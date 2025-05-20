import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, LineChart, TrendingUp } from "lucide-react"
import { getShopMetrics } from "@/app/actions/analytics-data-actions"

export async function ShopAnalyticsOverview({ shopId }: { shopId: string }) {
  const metrics = await getShopMetrics(shopId)

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalVisits.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.visitTrend > 0 ? "+" : ""}
            {metrics.visitTrend}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Flavor Logs</CardTitle>
          <LineChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalFlavorLogs.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.flavorLogTrend > 0 ? "+" : ""}
            {metrics.flavorLogTrend}% from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          <svg
            className="h-4 w-4 text-amber-400"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.averageRating.toFixed(1)}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.ratingTrend > 0 ? "+" : ""}
            {metrics.ratingTrend} from last month
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">New Followers</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.newFollowers}</div>
          <p className="text-xs text-muted-foreground">
            {metrics.followerTrend > 0 ? "+" : ""}
            {metrics.followerTrend}% from last month
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
