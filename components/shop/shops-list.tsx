"use client"

import { useState, useEffect } from "react"
import { Loader2, Star, Store } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

interface ShopsListProps {
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
}

export default function ShopsList({ searchQuery = "" }: ShopsListProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  // Fetch shops data
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.from("shops").select("*").order("rating", { ascending: false }).limit(50)

        if (error) throw error

        setShops(data || [])
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [supabase])

  // Filter shops based on search query
  useEffect(() => {
    if (!searchQuery) {
      setFilteredShops(shops)
      return
    }

    const query = searchQuery.toLowerCase()
    const filtered = shops.filter(
      (shop) =>
        shop.name.toLowerCase().includes(query) ||
        shop.city?.toLowerCase().includes(query) ||
        shop.state?.toLowerCase().includes(query) ||
        shop.description?.toLowerCase().includes(query),
    )

    setFilteredShops(filtered)
  }, [searchQuery, shops])

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (filteredShops.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No shops found</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          {searchQuery ? "Try a different search term or browse all shops" : "There are no shops in our database yet"}
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {filteredShops.map((shop) => (
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
          <CardContent className="pb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{shop.rating ? shop.rating.toFixed(1) : "New"}</span>
            </div>
            <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
              {shop.description || "No description available"}
            </p>
          </CardContent>
          <CardFooter className="pt-2">
            <Button asChild className="w-full">
              <Link href={`/dashboard/shops/${shop.id}`}>View Details</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
