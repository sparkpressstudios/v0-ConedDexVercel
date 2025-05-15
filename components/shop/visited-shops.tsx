"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// Demo data for visited shops
const DEMO_SHOPS = [
  {
    id: "1",
    name: "Scoops Delight",
    image_url: "/modern-ice-cream-shop.png",
    address: "123 Main St, Anytown, USA",
    rating: 4.5,
    visit_count: 3,
    last_visited: "2023-06-15",
  },
  {
    id: "2",
    name: "Berry Good Ice Cream",
    image_url: "/vintage-ice-cream-parlor.png",
    address: "456 Oak Ave, Somewhere, USA",
    rating: 4.2,
    visit_count: 2,
    last_visited: "2023-06-02",
  },
  {
    id: "3",
    name: "Minty Fresh",
    image_url: "/family-ice-cream-shop.png",
    address: "789 Pine Rd, Elsewhere, USA",
    rating: 4.8,
    visit_count: 1,
    last_visited: "2023-06-10",
  },
  {
    id: "4",
    name: "Cookie Monster",
    image_url: "/colorful-ice-cream-shop.png",
    address: "101 Spruce Ln, Nowhere, USA",
    rating: 4.7,
    visit_count: 1,
    last_visited: "2023-06-15",
  },
]

export default function VisitedShops({ userId, isDemoUser = false }) {
  const [shops, setShops] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchVisitedShops() {
      if (isDemoUser) {
        setShops(DEMO_SHOPS)
        setLoading(false)
        return
      }

      try {
        // Use the userId from props if available, otherwise use the authenticated user's ID
        const id = userId || user?.id

        if (!id) {
          console.error("No user ID available to fetch shops")
          setLoading(false)
          return
        }

        // First get all flavor logs to find visited shops
        const { data: flavorLogs, error: logsError } = await supabase
          .from("flavor_logs")
          .select("shop_id, date_logged")
          .eq("user_id", id)
          .order("date_logged", { ascending: false })

        if (logsError) {
          throw logsError
        }

        // Count visits per shop and get the last visit date
        const shopVisits = flavorLogs.reduce((acc, log) => {
          if (!acc[log.shop_id]) {
            acc[log.shop_id] = {
              visit_count: 0,
              last_visited: null,
            }
          }
          acc[log.shop_id].visit_count += 1
          const logDate = new Date(log.date_logged)
          if (!acc[log.shop_id].last_visited || logDate > new Date(acc[log.shop_id].last_visited)) {
            acc[log.shop_id].last_visited = log.date_logged
          }
          return acc
        }, {})

        // Get shop details for all visited shops
        const shopIds = Object.keys(shopVisits)
        if (shopIds.length === 0) {
          setShops([])
          setLoading(false)
          return
        }

        const { data: shopsData, error: shopsError } = await supabase
          .from("shops")
          .select("id, name, address, image_url, avg_rating")
          .in("id", shopIds)

        if (shopsError) {
          throw shopsError
        }

        // Combine shop data with visit data
        const visitedShops = shopsData.map((shop) => ({
          id: shop.id,
          name: shop.name,
          image_url: shop.image_url || "/colorful-ice-cream-shop.png",
          address: shop.address,
          rating: shop.avg_rating || 0,
          visit_count: shopVisits[shop.id].visit_count,
          last_visited: shopVisits[shop.id].last_visited,
        }))

        // Sort by most recently visited
        visitedShops.sort((a, b) => new Date(b.last_visited).getTime() - new Date(a.last_visited).getTime())

        setShops(visitedShops)
      } catch (error) {
        console.error("Error fetching visited shops:", error)
        // Fallback to demo data on error
        setShops(DEMO_SHOPS)
      } finally {
        setLoading(false)
      }
    }

    fetchVisitedShops()
  }, [userId, isDemoUser, supabase, user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shops I've Visited</CardTitle>
          <CardDescription>Loading your visited shops...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-40 rounded-md bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Shops I've Visited</CardTitle>
          <CardDescription>You haven't logged any shop visits yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-4">
              Start tracking your shop visits by logging flavors from different shops!
            </p>
            <Button asChild>
              <Link href="/dashboard/log-flavor">Log Your First Flavor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shops I've Visited</CardTitle>
        <CardDescription>You've visited {shops.length} different ice cream shops</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shops.map((shop) => (
            <Link href={`/dashboard/shops/${shop.id}`} key={shop.id} className="group">
              <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md h-full">
                <div className="aspect-video relative bg-gray-100">
                  <Image
                    src={shop.image_url || "/placeholder.svg"}
                    alt={shop.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{shop.name}</h3>
                  <div className="flex items-start gap-1 mt-1 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-amber-500" />
                      <span className="ml-1 font-medium">{shop.rating.toFixed(1)}</span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Visited {shop.visit_count} time{shop.visit_count !== 1 ? "s" : ""}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2">
                    Last visited: {new Date(shop.last_visited).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
