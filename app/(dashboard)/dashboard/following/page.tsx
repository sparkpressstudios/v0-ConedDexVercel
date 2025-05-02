"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Store, MapPin, Search, Loader2 } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { FollowButton } from "@/components/shop/follow-button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function FollowingPage() {
  const { user } = useAuth()
  const supabase = createClient()

  const [followedShops, setFollowedShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    const fetchFollowedShops = async () => {
      if (!user) return

      try {
        setLoading(true)

        // Get shops the user is following
        const { data, error } = await supabase
          .from("shop_followers")
          .select(`
            shop_id,
            shops:shop_id (
              id,
              name,
              address,
              city,
              state,
              image_url,
              is_verified
            )
          `)
          .eq("user_id", user.id)

        if (error) throw error

        // Extract shop data
        const shops = data.map((item) => item.shops)
        setFollowedShops(shops)
      } catch (error) {
        console.error("Error fetching followed shops:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowedShops()
  }, [user, supabase])

  // Filter shops based on search query
  const filteredShops = searchQuery
    ? followedShops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.state?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : followedShops

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shops You Follow</h1>
        <p className="text-muted-foreground">Stay updated with your favorite ice cream shops</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search followed shops..."
          className="pl-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : followedShops.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
          <Store className="h-10 w-10 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">No followed shops yet</h3>
          <p className="text-muted-foreground mt-2 mb-4">
            Follow your favorite ice cream shops to stay updated with their latest flavors and specials
          </p>
          <Button asChild>
            <Link href="/dashboard/shops">Discover Shops</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={shop.image_url || "/placeholder.svg?height=200&width=400&query=ice cream shop"}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg line-clamp-1">{shop.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5 mr-1" />
                      <span className="line-clamp-1">
                        {shop.address ? `${shop.address}, ` : ""}
                        {shop.city}, {shop.state}
                      </span>
                    </div>
                  </div>
                  {shop.is_verified && (
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">Verified</div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between p-4 pt-0">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/shops/${shop.id}`}>View Shop</Link>
                </Button>
                <FollowButton shopId={shop.id} initialFollowed={true} size="sm" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
