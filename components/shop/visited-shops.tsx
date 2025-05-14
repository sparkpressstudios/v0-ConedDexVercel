"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, MapPin } from "lucide-react"
import Link from "next/link"

type Shop = {
  id: string
  name: string
  address: string
  image_url?: string
  last_visited: string
  visit_count: number
}

export function VisitedShopsComponent() {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadVisitedShops() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        // Get user's shop visits with count and most recent visit
        const { data: shopVisits, error: visitsError } = await supabase
          .from("user_shop_visits")
          .select(`
            shop_id,
            created_at,
            shops:shop_id (
              id,
              name,
              address,
              image_url
            )
          `)
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })

        if (visitsError) {
          throw new Error(visitsError.message)
        }

        if (!shopVisits || shopVisits.length === 0) {
          setShops([])
          setLoading(false)
          return
        }

        // Process shop visits to get unique shops with visit count and last visit date
        const shopMap = new Map<string, Shop>()

        shopVisits.forEach((visit) => {
          const shopId = visit.shop_id
          const shop = visit.shops as any

          if (!shopMap.has(shopId)) {
            shopMap.set(shopId, {
              id: shop.id,
              name: shop.name,
              address: shop.address,
              image_url: shop.image_url,
              last_visited: visit.created_at,
              visit_count: 1,
            })
          } else {
            const existingShop = shopMap.get(shopId)!
            shopMap.set(shopId, {
              ...existingShop,
              visit_count: existingShop.visit_count + 1,
            })
          }
        })

        // Convert map to array and sort by most recent visit
        const processedShops = Array.from(shopMap.values())
          .sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime())
          .slice(0, 5)

        setShops(processedShops)
      } catch (err) {
        console.error("Error loading visited shops:", err)
        setError(err instanceof Error ? err.message : "Failed to load visited shops")
      } finally {
        setLoading(false)
      }
    }

    loadVisitedShops()
  }, [supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Visited Shops</CardTitle>
        <CardDescription>Ice cream shops you've visited</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <Skeleton className="h-4 w-[160px]" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : shops.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <p>You haven't visited any shops yet.</p>
            <p className="mt-2">Explore nearby ice cream shops and log your visits!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <Link
                href={`/dashboard/shops/${shop.id}`}
                key={shop.id}
                className="flex items-start space-x-4 p-2 rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                  {shop.image_url ? (
                    <img
                      src={shop.image_url || "/placeholder.svg"}
                      alt={shop.name}
                      className="h-12 w-12 rounded-md object-cover"
                    />
                  ) : (
                    <span className="text-lg font-bold text-primary">{shop.name.charAt(0)}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{shop.name}</h4>
                  <div className="flex items-center mt-1">
                    <MapPin className="h-3 w-3 text-muted-foreground mr-1" />
                    <p className="text-xs text-muted-foreground truncate">{shop.address}</p>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs">Last visit: {new Date(shop.last_visited).toLocaleDateString()}</span>
                    <span className="text-xs font-medium bg-primary/10 px-2 py-0.5 rounded-full">
                      {shop.visit_count} {shop.visit_count === 1 ? "visit" : "visits"}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add default export
export default function VisitedShops() {
  return <VisitedShopsComponent />
}
