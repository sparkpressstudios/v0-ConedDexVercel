"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { CheckCircle, Search, Star, Store, List, Filter, MapPin } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet"
import { ShopFilters } from "@/components/shop/shop-filters"

interface Shop {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  mainImage: string | null
  thumbnailImage: string | null
  website: string | null
  phone: string | null
  is_active: boolean
  is_verified: boolean
  created_at: string
  updated_at: string
  check_in_count: number
  flavor_count: number
}

export default function ShopsDirectory({
  initialShops,
  searchParams,
}: {
  initialShops: Shop[]
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const [shops, setShops] = useState<Shop[]>(initialShops)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [view, setView] = useState("grid")
  const [filters, setFilters] = useState({
    rating: 0,
    verifiedOnly: false,
    hasSpecials: false,
  })
  const router = useRouter()
  const searchParamsObj = useSearchParams()
  const { user } = useAuth()
  const supabase = createClient()

  // Load more shops
  const loadMoreShops = async () => {
    if (loading) return
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          id,
          name,
          description,
          address,
          city,
          state,
          zip,
          country,
          latitude,
          longitude,
          rating,
          mainImage,
          thumbnailImage,
          website,
          phone,
          is_active,
          is_verified,
          created_at,
          updated_at,
          shop_checkins(count),
          shop_flavors(count)
        `)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .range(shops.length, shops.length + 11)

      if (error) throw error

      const processedData =
        data?.map((shop) => ({
          ...shop,
          check_in_count: shop.shop_checkins?.[0]?.count || 0,
          flavor_count: shop.shop_flavors?.[0]?.count || 0,
        })) || []

      setShops((prev) => [...prev, ...processedData])
    } catch (error) {
      console.error("Error loading more shops:", error)
    } finally {
      setLoading(false)
    }
  }

  // Search shops
  const searchShops = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery.trim()) {
      setShops(initialShops)
      return
    }

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          id,
          name,
          description,
          address,
          city,
          state,
          zip,
          country,
          latitude,
          longitude,
          rating,
          mainImage,
          thumbnailImage,
          website,
          phone,
          is_active,
          is_verified,
          created_at,
          updated_at,
          shop_checkins(count),
          shop_flavors(count)
        `)
        .eq("is_active", true)
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
        .order("created_at", { ascending: false })
        .limit(20)

      if (error) throw error

      const processedData =
        data?.map((shop) => ({
          ...shop,
          check_in_count: shop.shop_checkins?.[0]?.count || 0,
          flavor_count: shop.shop_flavors?.[0]?.count || 0,
        })) || []

      setShops(processedData)
    } catch (error) {
      console.error("Error searching shops:", error)
    } finally {
      setLoading(false)
    }
  }

  // Apply filters
  const applyFilters = (newFilters: typeof filters) => {
    setFilters(newFilters)
    filterShops(newFilters)
  }

  // Filter shops based on filters
  const filterShops = async (activeFilters = filters) => {
    setLoading(true)
    try {
      let query = supabase
        .from("shops")
        .select(`
          id,
          name,
          description,
          address,
          city,
          state,
          zip,
          country,
          latitude,
          longitude,
          rating,
          mainImage,
          thumbnailImage,
          website,
          phone,
          is_active,
          is_verified,
          created_at,
          updated_at,
          shop_checkins(count),
          shop_flavors(count)
        `)
        .eq("is_active", true)

      if (activeFilters.rating > 0) {
        query = query.gte("rating", activeFilters.rating)
      }

      if (activeFilters.verifiedOnly) {
        query = query.eq("is_verified", true)
      }

      if (searchQuery) {
        query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%`)
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(20)

      if (error) throw error

      const processedData =
        data?.map((shop) => ({
          ...shop,
          check_in_count: shop.shop_checkins?.[0]?.count || 0,
          flavor_count: shop.shop_flavors?.[0]?.count || 0,
        })) || []

      setShops(processedData)
    } catch (error) {
      console.error("Error filtering shops:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <form onSubmit={searchShops} className="flex w-full max-w-lg gap-2">
          <Input
            type="search"
            placeholder="Search shops by name, description, or city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full"
          />
          <Button type="submit" size="icon">
            <Search className="h-4 w-4" />
            <span className="sr-only">Search</span>
          </Button>
        </form>

        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Shops</SheetTitle>
                <SheetDescription>Refine your search with these filters</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ShopFilters onApplyFilters={applyFilters} />
              </div>
            </SheetContent>
          </Sheet>

          <Tabs defaultValue="grid" value={view} onValueChange={setView} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="grid" className="flex items-center gap-1">
                <Store className="h-4 w-4" />
                <span>Grid</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="relative">
        <Tabs value={view} className="w-full">
          <TabsContent value="grid" className="mt-0">
            {shops.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {shops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="aspect-video w-full overflow-hidden bg-muted">
                      <Image
                        src={shop.mainImage || "/placeholder.svg?height=200&width=400&query=ice cream shop"}
                        alt={shop.name}
                        width={400}
                        height={200}
                        className="h-full w-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold line-clamp-1">{shop.name}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {shop.city}
                            {shop.state ? `, ${shop.state}` : ""}
                          </p>
                        </div>
                        {shop.rating && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span>{shop.rating.toFixed(1)}</span>
                          </Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>{shop.check_in_count} check-ins</span>
                        </Badge>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <Store className="h-3 w-3" />
                          <span>{shop.flavor_count} flavors</span>
                        </Badge>
                      </div>
                    </CardContent>
                    <CardFooter className="flex items-center justify-between p-4 pt-0">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/dashboard/shops/${shop.id}`}>View Details</Link>
                      </Button>
                      <Button size="sm" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        <span>Check In</span>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Store className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No shops found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-0">
            {shops.length > 0 ? (
              <div className="space-y-4">
                {shops.map((shop) => (
                  <Card key={shop.id} className="overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                      <div className="aspect-video w-full md:w-48 overflow-hidden bg-muted">
                        <Image
                          src={shop.mainImage || "/placeholder.svg?height=200&width=400&query=ice cream shop"}
                          alt={shop.name}
                          width={200}
                          height={150}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold">{shop.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {shop.city}
                              {shop.state ? `, ${shop.state}` : ""}
                            </p>
                          </div>
                          {shop.rating && (
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                              <span>{shop.rating.toFixed(1)}</span>
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-sm line-clamp-2">{shop.description || "No description available."}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <CheckCircle className="h-3 w-3" />
                            <span>{shop.check_in_count} check-ins</span>
                          </Badge>
                          <Badge variant="secondary" className="flex items-center gap-1">
                            <Store className="h-3 w-3" />
                            <span>{shop.flavor_count} flavors</span>
                          </Badge>
                        </div>
                        <div className="mt-auto flex items-center justify-between pt-4">
                          <Button asChild variant="outline" size="sm">
                            <Link href={`/dashboard/shops/${shop.id}`}>View Details</Link>
                          </Button>
                          <Button size="sm" className="gap-1">
                            <MapPin className="h-3 w-3" />
                            <span>Check In</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
                <Store className="h-10 w-10 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No shops found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        )}
      </div>

      {shops.length > 0 && (
        <div className="flex justify-center">
          <Button onClick={loadMoreShops} variant="outline" disabled={loading}>
            {loading ? "Loading..." : "Load More"}
          </Button>
        </div>
      )}
    </div>
  )
}
