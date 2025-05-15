"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Store } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

interface Shop {
  id: string
  name: string
  city: string
  state: string
  rating: number
  is_verified: boolean
  mainImage?: string
  check_in_count: number
}

export function FeaturedShops() {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchFeaturedShops = async () => {
      try {
        const { data, error } = await supabase
          .from("shops")
          .select(`
            id, name, city, state, rating, is_verified, mainImage,
            check_in_count:shop_checkins(count)
          `)
          .eq("is_active", true)
          .eq("is_verified", true)
          .order("rating", { ascending: false })
          .limit(3)

        if (error) throw error

        // Process data to get check-in counts
        const processedData = data.map((shop) => ({
          ...shop,
          check_in_count: shop.check_in_count?.[0]?.count || 0,
        }))

        setShops(processedData)
      } catch (error) {
        console.error("Error fetching featured shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedShops()
  }, [supabase])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Featured Shops</CardTitle>
          <CardDescription>Discover top-rated ice cream shops</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-video w-full" />
                  <div className="p-3">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-20 mb-2" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </Card>
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (shops.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Featured Shops</CardTitle>
            <CardDescription>Discover top-rated ice cream shops</CardDescription>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/shops">View All</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-3">
          {shops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {shop.mainImage ? (
                  <img
                    src={shop.mainImage || "/placeholder.svg"}
                    alt={shop.name}
                    className="h-full w-full object-cover transition-all hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50">
                    <Store className="h-10 w-10 text-purple-400" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-medium line-clamp-1">{shop.name}</h3>
                  {shop.is_verified && <Badge className="bg-purple-600 text-xs">Verified</Badge>}
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-2">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span>
                    {shop.city}, {shop.state}
                  </span>
                </div>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400 mr-1" />
                  <span className="text-sm font-medium">{shop.rating ? shop.rating.toFixed(1) : "New"}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full bg-purple-600 hover:bg-purple-700">
          <Link href="/shops">Explore All Shops</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
