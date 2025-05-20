"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { MapPin, Store, Navigation, AlertCircle } from "lucide-react"
import { getUserLocation, getNearbyShops } from "@/lib/services/location-service"
import { LogFlavorButton } from "@/components/flavor/log-flavor-button"

export function NearbyShopsWidget() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nearbyShops, setNearbyShops] = useState<any[]>([])
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    const fetchNearbyShops = async () => {
      setIsLoading(true)
      setError(null)

      try {
        // Get user's location
        const position = await getUserLocation()
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })

        // Find nearby shops
        const shops = await getNearbyShops(latitude, longitude, 2000) // 2km radius
        setNearbyShops(shops.slice(0, 3)) // Show top 3 shops
      } catch (error: any) {
        console.error("Error fetching nearby shops:", error)
        setError(error.message || "Unable to find nearby shops")
      } finally {
        setIsLoading(false)
      }
    }

    fetchNearbyShops()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Nearby Ice Cream Shops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5" />
            Nearby Ice Cream Shops
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">Location Unavailable</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">
              {error || "We couldn't access your location. Please enable location services to see nearby shops."}
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/shops/map")}>
            View Shops Map
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Nearby Ice Cream Shops
        </CardTitle>
      </CardHeader>
      <CardContent>
        {nearbyShops.length > 0 ? (
          <div className="space-y-3">
            {nearbyShops.map((shop) => (
              <div key={shop.place_id} className="flex items-start space-x-3 p-3 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-primary-50 flex items-center justify-center flex-shrink-0">
                  <Store className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{shop.name}</h4>
                  <p className="text-xs text-muted-foreground truncate">{shop.vicinity}</p>
                  <div className="flex items-center mt-1 space-x-2">
                    {shop.rating && (
                      <Badge variant="outline" className="text-xs">
                        {shop.rating} ★
                      </Badge>
                    )}
                    {shop.open_now && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 text-xs">
                        Open Now
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-shrink-0"
                  onClick={() => {
                    // Open in Google Maps
                    if (userLocation) {
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${userLocation.latitude},${userLocation.longitude}&destination=${shop.geometry.location.lat},${shop.geometry.location.lng}&travelmode=walking`,
                        "_blank",
                      )
                    }
                  }}
                >
                  <Navigation className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Store className="h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No Shops Nearby</h3>
            <p className="text-sm text-muted-foreground mt-1">
              We couldn't find any ice cream shops near your current location.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.push("/dashboard/shops/map")}>
          View Map
        </Button>
        <LogFlavorButton>Log Flavor</LogFlavorButton>
      </CardFooter>
    </Card>
  )
}
