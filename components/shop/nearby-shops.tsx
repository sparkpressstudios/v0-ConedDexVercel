"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Store, Loader2 } from "lucide-react"
import Link from "next/link"

interface Shop {
  id: string
  name: string
  city: string | null
  state: string | null
  latitude: number | null
  longitude: number | null
  distance: number
}

interface NearbyShopsProps {
  currentShopId: string
  latitude: number | null
  longitude: number | null
}

export function NearbyShops({ currentShopId, latitude, longitude }: NearbyShopsProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [loading, setLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  // Calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1)
    const dLon = deg2rad(lon2 - lon1)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const d = R * c // Distance in km
    return d
  }

  const deg2rad = (deg: number) => {
    return deg * (Math.PI / 180)
  }

  // Get user's location
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userLoc)
        fetchNearbyShops(userLoc.lat, userLoc.lng)
      },
      (error) => {
        console.error("Error getting location:", error)
        toast({
          title: "Location error",
          description: "Could not get your location. Using shop location instead.",
        })
        if (latitude && longitude) {
          fetchNearbyShops(latitude, longitude)
        } else {
          setLoading(false)
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  // Fetch nearby shops
  const fetchNearbyShops = async (lat: number, lng: number) => {
    try {
      const { data, error } = await supabase
        .from("shops")
        .select(`
          id,
          name,
          city,
          state,
          latitude,
          longitude
        `)
        .eq("is_active", true)
        .not("id", "eq", currentShopId)
        .not("latitude", "is", null)
        .not("longitude", "is", null)

      if (error) throw error

      // Calculate distance and sort by proximity
      const shopsWithDistance =
        data
          ?.map((shop) => ({
            ...shop,
            distance:
              shop.latitude && shop.longitude
                ? calculateDistance(lat, lng, shop.latitude, shop.longitude)
                : Number.MAX_VALUE,
          }))
          .filter((shop) => shop.distance < 10) // Only shops within 10km
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 5) || []

      setShops(shopsWithDistance)
    } catch (error) {
      console.error("Error fetching nearby shops:", error)
      toast({
        title: "Failed to load nearby shops",
        description: "There was an error loading nearby shops.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Initialize with shop location
  useEffect(() => {
    if (latitude && longitude) {
      fetchNearbyShops(latitude, longitude)
    } else {
      setLoading(false)
    }
  }, [latitude, longitude])

  if (!latitude || !longitude) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Nearby Shops</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : shops.length > 0 ? (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop.id} className="flex items-center justify-between">
                <div>
                  <Link href={`/dashboard/shops/${shop.id}`} className="font-medium hover:underline">
                    {shop.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {shop.city}
                    {shop.state ? `, ${shop.state}` : ""}
                  </p>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{shop.distance.toFixed(1)} km</span>
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">No nearby shops found</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={getUserLocation}>
              <MapPin className="mr-2 h-3 w-3" />
              Use My Location
            </Button>
          </div>
        )}

        {shops.length > 0 && (
          <div className="mt-4 flex justify-center">
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/shops/map">
                <Store className="mr-2 h-3 w-3" />
                View All on Map
              </Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
