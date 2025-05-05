"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"

type Shop = {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  lat: number
  lng: number
  rating: number
  flavor_count: number
  is_verified: boolean
}

export function SimplePublicShopsMap() {
  const supabase = createClient()
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)

  // Fetch shops data
  useEffect(() => {
    async function fetchShops() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("shops").select("*").limit(25)

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

  // Initialize map
  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setIsMapLoaded(true)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  // Try to get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        () => {
          console.log("Unable to retrieve your location")
        },
      )
    }
  }, [])

  // Calculate distance between two points using Haversine formula
  function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 3958.8 // Earth's radius in miles
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ice Cream Shop Map</CardTitle>
              <CardDescription>
                {shops.length} shops available
                {userLocation && <span className="ml-2">(Location detected)</span>}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="relative h-[70vh] w-full bg-muted">
            {!isMapLoaded ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-muted-foreground border-t-transparent"></div>
                <p className="mt-4 text-muted-foreground">Loading map...</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                {/* This would be replaced with an actual Google Map */}
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Map Visualization</h3>
                    <p className="mb-4">{shops.length} shops would be displayed here on the map</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {shops.slice(0, 5).map((shop) => (
                        <Badge key={shop.id} variant="outline" className="cursor-pointer">
                          {shop.name}
                        </Badge>
                      ))}
                      {shops.length > 5 && <Badge variant="outline">+{shops.length - 5} more</Badge>}
                    </div>
                    <Button className="mt-4" variant="outline" onClick={() => (window.location.href = "/login")}>
                      Sign in to view details
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shop List */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Ice Cream Shops</CardTitle>
          <CardDescription>{shops.length === 0 ? "No shops found" : `${shops.length} shops available`}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-40 rounded bg-muted"></div>
                    <div className="h-3 w-60 rounded bg-muted"></div>
                  </div>
                </div>
              ))
            ) : shops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No shops found</p>
              </div>
            ) : (
              shops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => (window.location.href = "/login")}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center">
                      <h4 className="font-medium">{shop.name}</h4>
                      {shop.is_verified && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {shop.address}, {shop.city}, {shop.state} {shop.zip}
                    </p>
                    <div className="flex items-center space-x-4 text-sm">
                      <span className="flex items-center">
                        <span className="mr-1 text-yellow-500">★</span>
                        {shop.rating.toFixed(1)}
                      </span>
                      <span>{shop.flavor_count} flavors</span>
                      {userLocation && (
                        <span>
                          {calculateDistance(userLocation.lat, userLocation.lng, shop.lat, shop.lng).toFixed(1)} miles
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
