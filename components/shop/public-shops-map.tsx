"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, MapPin, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ClientMapsLoader from "@/components/maps/maps-loader-client"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"

interface PublicShopsMapProps {
  searchQuery?: string
}

interface Shop {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip: string
  latitude: number
  longitude: number
  rating: number
  is_verified: boolean
  shop_type: string
  check_in_count: number
  flavor_count: number
  mainImage?: string
}

export default function PublicShopsMap({ searchQuery = "" }: PublicShopsMapProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const supabase = createClient()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Fetch shops data with check-in counts
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true)
      try {
        // Build query based on search parameters
        let query = supabase
          .from("shops")
          .select(`
            *,
            check_in_count:shop_checkins(count),
            flavor_count:shop_flavors(count)
          `)
          .not("latitude", "is", null)
          .not("longitude", "is", null)
          .eq("is_active", true)

        // Apply search query if provided
        if (searchQuery) {
          query = query.or(`name.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,state.ilike.%${searchQuery}%`)
        }

        // Apply filters from URL params
        if (searchParams.get("verified") === "true") {
          query = query.eq("is_verified", true)
        }

        const minRating = Number.parseInt(searchParams.get("rating") || "0")
        if (minRating > 0) {
          query = query.gte("rating", minRating)
        }

        if (searchParams.get("specials") === "true") {
          query = query.eq("has_seasonal_specials", true)
        }

        // Apply sorting
        const sortBy = searchParams.get("sort") || "popular"
        switch (sortBy) {
          case "popular":
            query = query.order("check_in_count", { ascending: false, foreignTable: "shop_checkins" })
            break
          case "rating":
            query = query.order("rating", { ascending: false })
            break
          case "newest":
            query = query.order("created_at", { ascending: false })
            break
          case "name":
            query = query.order("name", { ascending: true })
            break
          default:
            query = query.order("check_in_count", { ascending: false, foreignTable: "shop_checkins" })
        }

        const { data, error } = await query

        if (error) throw error

        // Process data to get check-in counts
        const processedData = data.map((shop) => ({
          ...shop,
          check_in_count: shop.check_in_count?.[0]?.count || 0,
          flavor_count: shop.flavor_count?.[0]?.count || 0,
        }))

        setShops(processedData)
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [supabase, searchQuery, searchParams])

  // Initialize map when loaded
  const initMap = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance
    infoWindowRef.current = new google.maps.InfoWindow()
  }, [])

  // Update markers when shops change
  useEffect(() => {
    if (!mapRef.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null))
    markersRef.current = {}

    // Add markers for shops
    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return

      const marker = new google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
        map: mapRef.current,
        title: shop.name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8 + Math.min(Math.log(shop.check_in_count + 1) * 2, 8), // Size based on check-ins
          fillColor: shop.is_verified ? "#10b981" : "#6366f1",
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
      })

      marker.addListener("click", () => {
        if (infoWindowRef.current) {
          infoWindowRef.current.close()

          const content = `
            <div style="padding: 8px; max-width: 200px;">
              <h3 style="margin: 0 0 8px; font-weight: 600;">${shop.name}</h3>
              <p style="margin: 0 0 4px; font-size: 14px;">${shop.address || ""}</p>
              <p style="margin: 0; font-size: 14px;">${shop.city || ""}, ${shop.state || ""} ${shop.zip || ""}</p>
              ${shop.rating ? `<p style="margin: 8px 0 0; font-size: 14px;">Rating: ${shop.rating.toFixed(1)} ⭐</p>` : ""}
              <p style="margin: 4px 0 0; font-size: 14px;">Check-ins: ${shop.check_in_count}</p>
            </div>
          `

          infoWindowRef.current.setContent(content)
          infoWindowRef.current.open(mapRef.current, marker)
          setSelectedShop(shop)
        }
      })

      markersRef.current[shop.id] = marker
    })

    // Fit bounds if we have markers
    if (Object.keys(markersRef.current).length > 0 && mapRef.current) {
      const bounds = new google.maps.LatLngBounds()
      Object.values(markersRef.current).forEach((marker) => {
        bounds.extend(marker.getPosition()!)
      })
      mapRef.current.fitBounds(bounds)

      // Don't zoom in too far
      const listener = google.maps.event.addListener(mapRef.current, "idle", () => {
        if (mapRef.current!.getZoom()! > 15) {
          mapRef.current!.setZoom(15)
        }
        google.maps.event.removeListener(listener)
      })
    }
  }, [shops])

  // Try to get user's location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          mapRef.current!.setCenter(userLocation)
          mapRef.current!.setZoom(13)

          // Add a marker for the user's location
          new google.maps.Marker({
            position: userLocation,
            map: mapRef.current,
            title: "Your Location",
            icon: {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#ef4444",
              fillOpacity: 0.9,
              strokeWeight: 2,
              strokeColor: "#ffffff",
            },
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="relative">
      <div className="h-[500px] w-full rounded-lg border">
        <ClientMapsLoader onMapLoad={initMap} />
      </div>

      <div className="absolute bottom-4 right-4 z-10 flex gap-2">
        <Button onClick={handleGetCurrentLocation} variant="secondary" size="sm">
          <MapPin className="mr-2 h-4 w-4" />
          Find Nearby
        </Button>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-green-500"></span>
                    <span>Verified</span>
                  </Badge>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shops verified by owners or ConeDex staff</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="flex items-center space-x-1">
                    <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                    <span>Unverified</span>
                  </Badge>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Shops added by the community, not yet verified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline">Larger circles = More check-ins</Badge>
                  <Info className="h-4 w-4 text-muted-foreground" />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Circle size indicates popularity based on user check-ins</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="text-sm text-muted-foreground">{shops.length} shops displayed</div>
      </div>

      {selectedShop && (
        <Card className="mt-4">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedShop.name}</CardTitle>
                <CardDescription>
                  {selectedShop.city}, {selectedShop.state}
                </CardDescription>
              </div>
              {selectedShop.is_verified && <Badge variant="default">Verified</Badge>}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {selectedShop.address}, {selectedShop.city}, {selectedShop.state} {selectedShop.zip}
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedShop.rating > 0 && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <span>Rating:</span>
                      <span className="font-bold">{selectedShop.rating.toFixed(1)}</span>
                      <span>⭐</span>
                    </Badge>
                  )}

                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Check-ins:</span>
                    <span className="font-bold">{selectedShop.check_in_count}</span>
                  </Badge>

                  <Badge variant="secondary" className="flex items-center gap-1">
                    <span>Flavors:</span>
                    <span className="font-bold">{selectedShop.flavor_count}</span>
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col items-end justify-end gap-2">
                <Button asChild size="sm">
                  <Link href={`/business/${selectedShop.id}`}>View Details</Link>
                </Button>

                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/shops/${selectedShop.id}`}>Check In</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
