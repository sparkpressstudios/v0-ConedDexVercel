"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Star, MapPin, IceCream, Calendar } from "lucide-react"

interface ShopStatisticsProps {
  shopId: string
}

export function ShopStatistics({ shopId }: ShopStatisticsProps) {
  const [stats, setStats] = useState({
    checkIns: 0,
    flavors: 0,
    rating: 0,
    reviewCount: 0,
    lastUpdated: "",
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        // Fetch check-ins count
        const { data: checkInsData, error: checkInsError } = await supabase
          .from("shop_checkins")
          .select("count")
          .eq("shop_id", shopId)
          .single()

        if (checkInsError && checkInsError.code !== "PGRST116") {
          throw checkInsError
        }

        // Fetch flavors count
        const { data: flavorsData, error: flavorsError } = await supabase
          .from("shop_flavors")
          .select("count")
          .eq("shop_id", shopId)
          .eq("is_active", true)
          .single()

        if (flavorsError && flavorsError.code !== "PGRST116") {
          throw flavorsError
        }

        // Fetch reviews data
        const { data: reviewsData, error: reviewsError } = await supabase
          .from("shop_reviews")
          .select("rating")
          .eq("shop_id", shopId)

        if (reviewsError) {
          throw reviewsError
        }

        // Calculate average rating
        let avgRating = 0
        if (reviewsData && reviewsData.length > 0) {
          avgRating = reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
        }

        // Fetch last updated date
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("updated_at")
          .eq("id", shopId)
          .single()

        if (shopError) {
          throw shopError
        }

        setStats({
          checkIns: checkInsData?.count || 0,
          flavors: flavorsData?.count || 0,
          rating: avgRating,
          reviewCount: reviewsData?.length || 0,
          lastUpdated: shopData?.updated_at || "",
        })
      } catch (error) {
        console.error("Error fetching shop statistics:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatistics()
  }, [shopId, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Statisticscs</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Check-ins:</span>
            </div>
            <span className="font-medium">{stats.checkIns}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <IceCream className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Flavors:</span>
            </div>
            <span className="font-medium">{stats.flavors}</span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Rating:</span>
            </div>
            <span className="font-medium flex items-center">
              {stats.rating.toFixed(1)}
              <Star className="ml-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-muted-foreground ml-1">({stats.reviewCount})</span>
            </span>
          </div>
          <div className="flex justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-sm">Last Updated:</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.lastUpdated ? new Date(stats.lastUpdated).toLocaleDateString() : "N/A"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
