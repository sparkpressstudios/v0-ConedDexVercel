"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Loader2, MapPin, Search, X } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ClientMapsLoader from "@/components/maps/client-maps-loader"
import { createClient } from "@/lib/supabase/client"

interface DashboardShopsMapProps {
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
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function DashboardShopsMap({ searchQuery = "" }: DashboardShopsMapProps) {
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery)
  const [selectedShopType, setSelectedShopType] = useState<string>("all")
  const [mapLoaded, setMapLoaded] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const supabase = createClient()

  // Update local search query when prop changes
  useEffect(() => {
    setLocalSearchQuery(searchQuery)
  }, [searchQuery])

  // Fetch shops data
  useEffect(() => {
    const fetchShops = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("shops")
          .select("*")
          .not("latitude", "is", null)
          .not("longitude", "is", null)

        if (error) throw error

        setShops(data || [])
        setFilteredShops(data || [])
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShops()
  }, [supabase])

  // Filter shops based on search query and shop type
  useEffect(() => {
    let filtered = shops

    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase()
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.city?.toLowerCase().includes(query) ||
          shop.state?.toLowerCase().includes(query),
      )
    }

    if (selectedShopType !== "all") {
      filtered = filtered.filter((shop) => shop.shop_type === selectedShopType)
    }

    setFilteredShops(filtered)
  }, [localSearchQuery, selectedShopType, shops])

  // Initialize map when loaded
  const initMap = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance
    infoWindowRef.current = new window.google.maps.InfoWindow()
    setMapLoaded(true)
  }, [])

  // Update markers when filtered shops change
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null))
    markersRef.current = {}

    // Add markers for filtered shops
    filteredShops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return

      const marker = new window.google.maps.Marker({
        position: { lat: shop.latitude, lng: shop.longitude },
        map: mapRef.current,
        title: shop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
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
      const bounds = new window.google.maps.LatLngBounds()
      Object.values(markersRef.current).forEach((marker) => {
        bounds.extend(marker.getPosition()!)
      })
      mapRef.current.fitBounds(bounds)

      // Don't zoom in too far
      const listener = window.google.maps.event.addListener(mapRef.current, "idle", () => {
        if (mapRef.current!.getZoom()! > 15) {
          mapRef.current!.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [filteredShops, mapLoaded])

  // Get unique shop types for filter
  const shopTypes = [...new Set(shops.map((shop) => shop.shop_type))].filter(Boolean)

  // Get user's current location
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
          new window.google.maps.Marker({
            position: userLocation,
            map: mapRef.current,
            title: "Your Location",
            icon: {
              path: window.google.maps.SymbolPath.CIRCLE,
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

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Filter map by name or location..."
            className="pl-8"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
          />
          {localSearchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-9 w-9 rounded-l-none p-0"
              onClick={() => setLocalSearchQuery("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Clear</span>
            </Button>
          )}
        </div>
        <Select value={selectedShopType} onValueChange={setSelectedShopType}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Shop type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {shopTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type ? type.charAt(0).toUpperCase() + type.slice(1) : "Unknown"}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={handleGetCurrentLocation} className="whitespace-nowrap">
          <MapPin className="mr-2 h-4 w-4" />
          My Location
        </Button>
      </div>

      <div className="rounded-md border">
        {isLoading ? (
          <div className="flex h-[500px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="relative h-[500px] w-full">
            <ClientMapsLoader onMapLoad={initMap} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-green-500"></span>
            <span>Verified</span>
          </Badge>
          <Badge variant="outline" className="flex items-center space-x-1">
            <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
            <span>Unverified</span>
          </Badge>
        </div>
        <div className="text-sm text-muted-foreground">{filteredShops.length} shops displayed</div>
      </div>

      {selectedShop && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>{selectedShop.name}</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setSelectedShop(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-start space-x-2">
                <MapPin className="mt-0.5 h-4 w-4 text-muted-foreground" />
                <div>
                  <p>{selectedShop.address || "Address not available"}</p>
                  <p>
                    {selectedShop.city || ""}, {selectedShop.state || ""} {selectedShop.zip || ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Badge variant={selectedShop.is_verified ? "default" : "outline"}>
                  {selectedShop.is_verified ? "Verified" : "Unverified"}
                </Badge>
                {selectedShop.shop_type && (
                  <Badge variant="secondary">
                    {selectedShop.shop_type.charAt(0).toUpperCase() + selectedShop.shop_type.slice(1)}
                  </Badge>
                )}
              </div>

              {selectedShop.rating && (
                <div className="flex items-center space-x-1">
                  <span className="text-sm font-medium">Rating:</span>
                  <span className="text-sm">{selectedShop.rating.toFixed(1)}</span>
                  <span className="text-amber-500">★</span>
                </div>
              )}

              <div className="pt-2">
                <Button size="sm" onClick={() => window.open(`/dashboard/shops/${selectedShop.id}`, "_blank")}>
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default DashboardShopsMap
