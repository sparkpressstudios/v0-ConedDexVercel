"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function VisitedShops() {
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchVisitedShops() {
      if (!user?.id) return

      try {
        setLoading(true)

        // Get unique shop IDs from flavor logs
        const { data: flavorLogs, error: logsError } = await supabase
          .from("flavor_logs")
          .select("shop_id")
          .eq("user_id", user.id)
          .not("shop_id", "is", null)

        if (logsError) throw logsError

        if (!flavorLogs || flavorLogs.length === 0) {
          setShops([])
          return
        }

        // Get unique shop IDs
        const shopIds = [...new Set(flavorLogs.map((log) => log.shop_id))]

        // Fetch shop details
        const { data: shopData, error: shopsError } = await supabase
          .from("shops")
          .select("*")
          .in("id", shopIds)
          .order("name")

        if (shopsError) throw shopsError

        setShops(shopData || [])
      } catch (error) {
        console.error("Error fetching visited shops:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitedShops()
  }, [supabase, user?.id])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visited Shops</CardTitle>
        <CardDescription>Ice cream shops you've visited</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : shops.length > 0 ? (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop.id} className="flex items-center gap-3 p-3 rounded-lg border">
                <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-orange-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium truncate">{shop.name}</h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Star className="h-3 w-3 mr-1 text-yellow-400 fill-yellow-400" />
                    <span>{shop.rating || "4.5"}</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/shops/${shop.id}`}>View</Link>
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">You haven't visited any shops yet</p>
            <p className="text-sm text-muted-foreground mt-1">Log flavors at shops to see them here</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/shops">Find Shops</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default VisitedShops
