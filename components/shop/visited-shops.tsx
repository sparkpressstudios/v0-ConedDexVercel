"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, MapPin, Calendar, Clock, Award } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

interface VisitedShop {
  id: string
  name: string
  address: string
  image_url: string
  rating: number
  visit_count: number
  last_visit: string
  flavors_tried: number
  favorite_flavor: string
  location: { lat: number; lng: number }
  website?: string
  phone?: string
  hours?: string
}

export default function VisitedShops() {
  const [shops, setShops] = useState<VisitedShop[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    async function fetchVisitedShops() {
      try {
        const { data: user } = await supabase.auth.getUser()

        if (!user.user) {
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("user_shop_visits")
          .select(`
            shop_id,
            visit_count,
            last_visit,
            shops (
              id,
              name,
              address,
              image_url,
              rating,
              location,
              website,
              phone,
              hours
            ),
            user_flavor_logs (
              id,
              name
            )
          `)
          .eq("user_id", user.user.id)
          .order("last_visit", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data
        const transformedShops = data.map((item) => {
          const shop = item.shops
          return {
            id: shop.id,
            name: shop.name,
            address: shop.address,
            image_url: shop.image_url || "/colorful-ice-cream-shop.png",
            rating: shop.rating,
            visit_count: item.visit_count,
            last_visit: item.last_visit,
            flavors_tried: item.user_flavor_logs ? item.user_flavor_logs.length : 0,
            favorite_flavor:
              item.user_flavor_logs && item.user_flavor_logs.length > 0 ? item.user_flavor_logs[0].name : "None yet",
            location: shop.location,
            website: shop.website,
            phone: shop.phone,
            hours: shop.hours,
          }
        })

        setShops(transformedShops)
      } catch (error) {
        console.error("Error fetching visited shops:", error)
        toast({
          title: "Error",
          description: "Failed to load your visited shops",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchVisitedShops()
  }, [supabase, toast])

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Visited Shops</CardTitle>
          <CardDescription>You haven't visited any shops yet.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Start exploring ice cream shops and logging flavors to build your collection!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Your Visited Shops</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.map((shop) => (
          <Card key={shop.id} className="overflow-hidden">
            <div className="h-40 overflow-hidden">
              <img src={shop.image_url || "/placeholder.svg"} alt={shop.name} className="w-full h-full object-cover" />
            </div>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <CardTitle className="text-lg">{shop.name}</CardTitle>
                <Badge variant="outline" className="flex items-center">
                  <Star className="h-4 w-4 mr-1" />
                  {shop.rating.toFixed(1)}
                </Badge>
              </div>
              <CardDescription className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {shop.address}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  <span>Visits: {shop.visit_count}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Last: {new Date(shop.last_visit).toLocaleDateString()}</span>
                </div>
              </div>
              <div className="flex items-center text-sm">
                <Award className="h-4 w-4 mr-1" />
                <span>Flavors tried: {shop.flavors_tried}</span>
              </div>
              {shop.favorite_flavor && (
                <div className="text-sm">
                  <span className="font-medium">Favorite:</span> {shop.favorite_flavor}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
