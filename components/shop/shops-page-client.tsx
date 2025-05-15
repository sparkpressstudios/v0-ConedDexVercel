"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List, Map, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import PublicShopsMap from "@/components/shop/public-shops-map"
import PublicShopsList from "@/components/shop/public-shops-list"
import ShopFilters from "@/components/shop/shop-filters"
import { useRouter, useSearchParams } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

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
  latitude?: number
  longitude?: number
}

interface ShopsPageClientProps {
  initialShops: Shop[]
  searchParams: { [key: string]: string | string[] | undefined }
}

export default function ShopsPageClient({ initialShops, searchParams }: ShopsPageClientProps) {
  const router = useRouter()
  const searchParamsObj = useSearchParams()
  const [searchQuery, setSearchQuery] = useState(searchParamsObj.get("q") || "")
  const [activeView, setActiveView] = useState<"list" | "map">(
    (searchParamsObj.get("view") as "list" | "map") || "list",
  )
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [isLoading, setIsLoading] = useState(false)
  const [totalShops, setTotalShops] = useState(initialShops.length)
  const supabase = createClient()

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParamsObj.toString())
    params.set("view", activeView)
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    router.push(`/shops?${params.toString()}`, { scroll: false })
  }, [activeView, searchQuery, router, searchParamsObj])

  // Fetch shops when filters change
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true)
      try {
        // Build query based on search parameters
        let query = supabase
          .from("shops")
          .select(
            `
            *,
            check_in_count:shop_checkins(count),
            flavor_count:shop_flavors(count)
          `,
            { count: "exact" },
          )
          .eq("is_active", true)

        // Apply search query if provided
        if (searchParamsObj.get("q")) {
          query = query.or(
            `name.ilike.%${searchParamsObj.get("q")}%,city.ilike.%${searchParamsObj.get(
              "q",
            )}%,state.ilike.%${searchParamsObj.get("q")}%`,
          )
        }

        // Apply filters from URL params
        if (searchParamsObj.get("verified") === "true") {
          query = query.eq("is_verified", true)
        }

        const minRating = Number.parseInt(searchParamsObj.get("rating") || "0")
        if (minRating > 0) {
          query = query.gte("rating", minRating)
        }

        if (searchParamsObj.get("specials") === "true") {
          query = query.eq("has_seasonal_specials", true)
        }

        // Apply sorting
        const sortBy = searchParamsObj.get("sort") || "popular"
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

        const { data, error, count } = await query

        if (error) throw error

        // Process data to get check-in counts
        const processedData = data.map((shop) => ({
          ...shop,
          check_in_count: shop.check_in_count?.[0]?.count || 0,
          flavor_count: shop.flavor_count?.[0]?.count || 0,
        }))

        setShops(processedData)
        if (count !== null) {
          setTotalShops(count)
        }
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [supabase, searchParamsObj])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParamsObj.toString())
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    params.set("view", activeView)
    router.push(`/shops?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shops by name or location..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button type="submit" variant="default">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "list" | "map")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1">
                <Map className="h-4 w-4" />
                <span>Map</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Shops</SheetTitle>
                <SheetDescription>Refine your search with these filters</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ShopFilters />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm font-normal">
            {totalShops} {totalShops === 1 ? "shop" : "shops"} found
          </Badge>
          {searchParamsObj.get("q") && (
            <Badge variant="secondary" className="text-sm font-normal">
              Search: {searchParamsObj.get("q")}
            </Badge>
          )}
          {searchParamsObj.get("verified") === "true" && (
            <Badge variant="secondary" className="text-sm font-normal">
              Verified only
            </Badge>
          )}
          {searchParamsObj.get("rating") && (
            <Badge variant="secondary" className="text-sm font-normal">
              {searchParamsObj.get("rating")}+ stars
            </Badge>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {activeView === "list" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Directory</CardTitle>
              <CardDescription>Browse all ice cream shops with check-in statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <PublicShopsList shops={shops} isLoading={isLoading} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Map</CardTitle>
              <CardDescription>View shops and check-ins on an interactive map</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <PublicShopsMap shops={shops} isLoading={isLoading} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
