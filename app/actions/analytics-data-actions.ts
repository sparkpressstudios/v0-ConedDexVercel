"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { unstable_cache } from "next/cache"

type TimeFrame = "7d" | "30d" | "90d" | "1y"
type MetricType = "visits" | "flavor_logs" | "ratings" | "followers"

interface AnalyticsDataPoint {
  date: string
  value: number
}

interface ShopMetricsResponse {
  totalVisits: number
  totalFlavorLogs: number
  averageRating: number
  newFollowers: number
  visitTrend: number
  flavorLogTrend: number
  ratingTrend: number
  followerTrend: number
}

interface TimeSeriesResponse {
  visits: AnalyticsDataPoint[]
  flavorLogs: AnalyticsDataPoint[]
  ratings: AnalyticsDataPoint[]
  followers: AnalyticsDataPoint[]
}

export const getShopMetrics = unstable_cache(
  async (shopId: string): Promise<ShopMetricsResponse> => {
    try {
      const supabase = createServerActionClient({ cookies })

      // Get total visits
      const { data: visitsData, error: visitsError } = await supabase
        .from("shop_checkins")
        .select("count", { count: "exact" })
        .eq("shop_id", shopId)

      if (visitsError) throw visitsError

      // Get total flavor logs
      const { data: flavorLogsData, error: flavorLogsError } = await supabase
        .from("flavor_logs")
        .select("count", { count: "exact" })
        .eq("shop_id", shopId)

      if (flavorLogsError) throw flavorLogsError

      // Get average rating
      const { data: ratingsData, error: ratingsError } = await supabase
        .from("shop_reviews")
        .select("rating")
        .eq("shop_id", shopId)

      if (ratingsError) throw ratingsError

      const averageRating =
        ratingsData.length > 0 ? ratingsData.reduce((sum, item) => sum + item.rating, 0) / ratingsData.length : 0

      // Get new followers (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: followersData, error: followersError } = await supabase
        .from("shop_followers")
        .select("count", { count: "exact" })
        .eq("shop_id", shopId)
        .gte("created_at", thirtyDaysAgo.toISOString())

      if (followersError) throw followersError

      // Calculate trends (simplified - in a real app, would compare to previous period)
      // For now, using placeholder values that would be calculated from historical data
      const visitTrend = 12 // Percentage increase
      const flavorLogTrend = 5
      const ratingTrend = 0.2
      const followerTrend = 18

      return {
        totalVisits: visitsData[0]?.count || 0,
        totalFlavorLogs: flavorLogsData[0]?.count || 0,
        averageRating,
        newFollowers: followersData[0]?.count || 0,
        visitTrend,
        flavorLogTrend,
        ratingTrend,
        followerTrend,
      }
    } catch (error) {
      console.error("Error fetching shop metrics:", error)
      return {
        totalVisits: 0,
        totalFlavorLogs: 0,
        averageRating: 0,
        newFollowers: 0,
        visitTrend: 0,
        flavorLogTrend: 0,
        ratingTrend: 0,
        followerTrend: 0,
      }
    }
  },
  ["shop-metrics"],
  {
    revalidate: 3600, // Cache for 1 hour
  },
)

export const getTimeSeriesData = unstable_cache(
  async (shopId: string, timeframe: TimeFrame, metric: MetricType): Promise<AnalyticsDataPoint[]> => {
    try {
      const supabase = createServerActionClient({ cookies })
      const startDate = getStartDateForTimeframe(timeframe)

      let table: string
      const dateColumn = "created_at"
      let valueColumn: string | null = null

      // Determine which table and columns to query based on the metric
      switch (metric) {
        case "visits":
          table = "shop_checkins"
          break
        case "flavor_logs":
          table = "flavor_logs"
          break
        case "ratings":
          table = "shop_reviews"
          valueColumn = "rating"
          break
        case "followers":
          table = "shop_followers"
          break
        default:
          throw new Error("Invalid metric type")
      }

      // For metrics that need aggregation by day
      if (!valueColumn) {
        const { data, error } = await supabase
          .from(table)
          .select(dateColumn)
          .eq("shop_id", shopId)
          .gte(dateColumn, startDate.toISOString())
          .order(dateColumn, { ascending: true })

        if (error) throw error

        // Group by day and count
        const groupedByDay = data.reduce((acc: Record<string, number>, item) => {
          const date = new Date(item[dateColumn as keyof typeof item] as string).toISOString().split("T")[0]
          acc[date] = (acc[date] || 0) + 1
          return acc
        }, {})

        return Object.entries(groupedByDay).map(([date, value]) => ({ date, value }))
      } else {
        // For metrics that need to average values (like ratings)
        const { data, error } = await supabase
          .from(table)
          .select(`${dateColumn}, ${valueColumn}`)
          .eq("shop_id", shopId)
          .gte(dateColumn, startDate.toISOString())
          .order(dateColumn, { ascending: true })

        if (error) throw error

        // Group by day and average
        const groupedByDay = data.reduce((acc: Record<string, { sum: number; count: number }>, item) => {
          const date = new Date(item[dateColumn as keyof typeof item] as string).toISOString().split("T")[0]
          if (!acc[date]) {
            acc[date] = { sum: 0, count: 0 }
          }
          acc[date].sum += item[valueColumn as keyof typeof item] as number
          acc[date].count += 1
          return acc
        }, {})

        return Object.entries(groupedByDay).map(([date, { sum, count }]) => ({
          date,
          value: count > 0 ? sum / count : 0,
        }))
      }
    } catch (error) {
      console.error(`Error fetching ${metric} time series data:`, error)
      return []
    }
  },
  ["shop-time-series"],
  {
    revalidate: 3600, // Cache for 1 hour
  },
)

export const getAllTimeSeriesData = unstable_cache(
  async (shopId: string, timeframe: TimeFrame): Promise<TimeSeriesResponse> => {
    const [visits, flavorLogs, ratings, followers] = await Promise.all([
      getTimeSeriesData(shopId, timeframe, "visits"),
      getTimeSeriesData(shopId, timeframe, "flavor_logs"),
      getTimeSeriesData(shopId, timeframe, "ratings"),
      getTimeSeriesData(shopId, timeframe, "followers"),
    ])

    return {
      visits,
      flavorLogs,
      ratings,
      followers,
    }
  },
  ["shop-all-time-series"],
  {
    revalidate: 3600, // Cache for 1 hour
  },
)

// Helper function to get start date based on timeframe
function getStartDateForTimeframe(timeframe: TimeFrame): Date {
  const date = new Date()
  switch (timeframe) {
    case "7d":
      date.setDate(date.getDate() - 7)
      break
    case "30d":
      date.setDate(date.getDate() - 30)
      break
    case "90d":
      date.setDate(date.getDate() - 90)
      break
    case "1y":
      date.setFullYear(date.getFullYear() - 1)
      break
  }
  return date
}

// Customer demographics data
export async function getCustomerDemographics(shopId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    // In a real implementation, this would query user profiles of customers
    // who have checked in at this shop and aggregate their demographic data
    // For now, returning placeholder data
    return {
      ageGroups: [
        { name: "18-24", value: 15 },
        { name: "25-34", value: 40 },
        { name: "35-44", value: 25 },
        { name: "45-54", value: 12 },
        { name: "55+", value: 8 },
      ],
      visitFrequency: [
        { name: "First time", value: 30 },
        { name: "Occasional", value: 45 },
        { name: "Regular", value: 20 },
        { name: "Frequent", value: 5 },
      ],
    }
  } catch (error) {
    console.error("Error fetching customer demographics:", error)
    return {
      ageGroups: [],
      visitFrequency: [],
    }
  }
}

// Flavor popularity data
export async function getFlavorPopularity(shopId: string) {
  try {
    const supabase = createServerActionClient({ cookies })

    const { data, error } = await supabase
      .from("flavor_logs")
      .select("flavor_id, flavors(name), rating")
      .eq("shop_id", shopId)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) throw error

    // Group by flavor and calculate average rating and count
    const flavorStats = data.reduce(
      (acc: Record<string, { name: string; count: number; totalRating: number }>, item) => {
        const flavorId = item.flavor_id as string
        const flavorName = (item.flavors as any)?.name || "Unknown Flavor"

        if (!acc[flavorId]) {
          acc[flavorId] = { name: flavorName, count: 0, totalRating: 0 }
        }

        acc[flavorId].count += 1
        acc[flavorId].totalRating += item.rating || 0

        return acc
      },
      {},
    )

    // Convert to array and sort by count
    const popularFlavors = Object.values(flavorStats)
      .map(({ name, count, totalRating }) => ({
        name,
        count,
        averageRating: count > 0 ? totalRating / count : 0,
      }))
      .sort((a, b) => b.count - a.count)

    return popularFlavors.slice(0, 10) // Return top 10
  } catch (error) {
    console.error("Error fetching flavor popularity:", error)
    return []
  }
}
