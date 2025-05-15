"use client"

import { useState, useEffect } from "react"
import { Star, Store, MapPin, Users, IceCream } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

interface PublicShopsListProps {
  searchQuery?: string
}

interface Shop {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  rating: number
  is_verified: boolean
  shop_type: string
  mainImage?: string
  thumbnailImage?: string
  check_in_count: number
  flavor_count: number
  created_at: string
}

export default function PublicShopsList({ searchQuery = "" }: PublicShopsListProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [maxCheckIns, setMaxCheckIns] = useState(0)
  const supabase = createClient()
  const searchParams = useSearchParams()

  // Fetch shops data with check-in counts
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true)
      try {
        // Build query based on search parameters
        let query = supabase
          .from("shops")
          .select(`
            *,
            check_in_count:shop_checkins(count),
            flavor_count:shop_flavors(count)
          `)
          .eq("is_active", true)

        // Apply search query if provided
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`)
        }

        // Apply filters from URL params
        if (searchParams.get("verified") === "true") {
          query = query.eq("is_verified", true)
        }

        const minRating = Number.parseInt(searchParams.get("rating") || "0")
        if (minRating > 0) {
          query = query.gte("rating", minRating)
        }

        if (searchParams.get("specials") === "true") {
          query = query.eq("has_seasonal_specials", true)
        }

        // Apply sorting
        const sortBy = searchParams.get("sort") || "popular"
        switch (sortBy) {
          case "popular":
            query = query.order("check_in_count", { ascending: false, foreignTable: "shop_checkins" })
            break
          case "rating":
            query = query.order("rating", { ascending: false })
            break
          case "newest":
            query = query.order("created_at", { ascending: false })
            break
          case "name":
            query = query.order("name", { ascending: true })
            break
          default:
            query = query.order("check_in_count", { ascending: false, foreignTable: "shop_checkins" })
        }

        const { data, error } = await query

        if (error) throw error

        // Process data to get check-in counts
        const processedData = data.map((shop) => ({
          ...shop,
          check_in_count: shop.check_in_count?.[0]?.count || 0,
          flavor_count: shop.flavor_count?.[0]?.count || 0,
        }))

        // Find max check-ins for progress bar
        const maxCheckins = Math.max(...processedData.map((shop) => shop.check_in_count), 1)
        setMaxCheckIns(maxCheckins)

        setShops(processedData)
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [supabase, searchQuery, searchParams])

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-16 w-full" />
              </CardContent>
              <div className="px-6 pb-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No shops found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {searchQuery
            ? "Try a different search term or adjust your filters"
            : "There are no shops matching your criteria"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <Store className="h-10 w-10 text-muted-foreground" />
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-1">{shop.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {shop.city}, {shop.state}
                </CardDescription>
              </div>
              {shop.is_verified && (
                <Badge variant="default" className="ml-2">
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{shop.rating ? shop.rating.toFixed(1) : "New"}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Check-ins:</span>
                </div>
                <span className="font-medium">{shop.check_in_count}</span>
              </div>
              <Progress value={(shop.check_in_count / maxCheckIns) * 100} className="h-2" />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <IceCream className="h-4 w-4 text-muted-foreground" />
                <span>Flavors:</span>
              </div>
              <span className="font-medium">{shop.flavor_count}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{shop.address || `${shop.city}, ${shop.state}`}</span>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/business/${shop.id}`}>Details</Link>
            </Button>
            <Button asChild size="sm">
              <Link href={`/dashboard/shops/${shop.id}`}>Check In</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
