"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Star, MapPin, Store, CheckCircle, Plus } from "lucide-react"
import Link from "next/link"
import { AddFlavorModal } from "./add-flavor-modal"

interface Shop {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  rating: number | null
  mainImage: string | null
  image_url: string | null
  is_verified: boolean
  check_in_count: number
  flavor_count: number
}

interface ShopSearchResultsProps {
  query: string
}

export function ShopSearchResults({ query }: ShopSearchResultsProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [isAddFlavorModalOpen, setIsAddFlavorModalOpen] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    const searchShops = async () => {
      if (!query.trim()) {
        setShops([])
        setLoading(false)
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
            rating,
            image_url,
            is_verified,
            shop_checkins(count),
            shop_flavors(count)
          `)
          .eq("is_active", true)
          .or(`name.ilike.%${query}%,description.ilike.%${query}%,city.ilike.%${query}%`)
          .order("created_at", { ascending: false })
          .limit(20)

        if (error) throw error

        const processedData =
          data?.map((shop) => ({
            ...shop,
            check_in_count: shop.shop_checkins?.[0]?.count || 0,
            flavor_count: shop.shop_flavors?.[0]?.count || 0,
            mainImage: shop.image_url,
          })) || []

        setShops(processedData)
      } catch (error) {
        console.error("Error searching shops:", error)
        toast({
          title: "Search failed",
          description: "Failed to search shops. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    searchShops()
  }, [query, supabase, toast])

  // Handle adding a new flavor
  const handleAddFlavor = (shop: Shop) => {
    setSelectedShop(shop)
    setIsAddFlavorModalOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="h-5 w-40 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                </div>
                <div className="h-6 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="mt-4 h-4 w-full bg-gray-200 rounded"></div>
              <div className="mt-2 flex gap-2">
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
                <div className="h-5 w-24 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
            <CardFooter className="flex items-center justify-between p-4 pt-0">
              <div className="h-9 w-20 bg-gray-200 rounded"></div>
              <div className="h-9 w-24 bg-gray-200 rounded"></div>
            </CardFooter>
          </Card>
        ))}
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
        <Store className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">No shops found</h3>
        <p className="text-sm text-muted-foreground">Try a different search term</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {shops.length} shops matching "{query}"
      </p>

      {shops.map((shop) => (
        <Card key={shop.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{shop.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {shop.city}
                  {shop.state ? `, ${shop.state}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {shop.is_verified && (
                  <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
                {shop.rating && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>{shop.rating.toFixed(1)}</span>
                  </Badge>
                )}
              </div>
            </div>
            <p className="mt-2 text-sm line-clamp-2">{shop.description || "No description available."}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
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
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleAddFlavor(shop)}>
                <Plus className="h-3 w-3 mr-1" />
                Add Flavor
              </Button>
              <Button size="sm" asChild>
                <Link href={`/dashboard/shops/map?shop=${shop.id}`}>
                  <MapPin className="h-3 w-3 mr-1" />
                  View on Map
                </Link>
              </Button>
            </div>
          </CardFooter>
        </Card>
      ))}

      {/* Add Flavor Modal */}
      {selectedShop && (
        <AddFlavorModal
          isOpen={isAddFlavorModalOpen}
          onClose={() => setIsAddFlavorModalOpen(false)}
          shop={selectedShop}
        />
      )}
    </div>
  )
}
