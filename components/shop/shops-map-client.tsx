"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, MapPin, Info, Star, Store, ExternalLink } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"
import { loadGoogleMapsScript } from "@/app/actions/maps-key-actions"

interface Shop {
  id: string
  name: string
  description: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  latitude: number | null
  longitude: number | null
  rating: number | null
  mainImage: string | null
  image_url: string | null
  is_verified: boolean
  check_in_count: number
  flavor_count: number
}

interface ShopsMapClientProps {
  shops: Shop[]
  highlightedShopId?: string
}

export default function ShopsMapClient({ shops, highlightedShopId }: ShopsMapClientProps) {
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [mapLoaded, setMapLoaded] = useState(false)

  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  // Load Google Maps script
  useEffect(() => {
    if (window.google?.maps) {
      initializeMap()
      return
    }

    // Check if the script is already being loaded
    const existingScript = document.getElementById("google-maps-script")
    if (existingScript) {
      return
    }

    // Load the script using the server action
    const loadScript = async () => {
      try {
        await loadGoogleMapsScript()

        // Create a script element to load Google Maps
        const script = document.createElement("script")
        script.id = "google-maps-script"
        script.src = "/api/maps/script" // Use our proxy endpoint
        script.async = true
        script.defer = true
        script.onload = initializeMap
        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        toast({
          title: "Error",
          description: "Failed to load Google Maps. Please try again later.",
          variant: "destructive",
        })
      }
    }

    loadScript()

    return () => {
      // Clean up only if the script was added by this component
      const script = document.getElementById("google-maps-script")
      if (script && script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [toast])

  // Initialize map
  const initializeMap = () => {
    if (!mapContainerRef.current) return

    const mapOptions = {
      center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
      zoom: 10,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: "poi",
          elementType: "labels",
          stylers: [{ visibility: "off" }],
        },
      ],
    }

    const map = new window.google.maps.Map(mapContainerRef.current, mapOptions)
    mapRef.current = map
    infoWindowRef.current = new window.google.maps.InfoWindow()
    setMapLoaded(true)
  }

  // Add markers to the map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || !window.google) return

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.setMap(null))
    markersRef.current = {}

    // Add markers for shops
    const bounds = new window.google.maps.LatLngBounds()

    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return

      const position = { lat: shop.latitude, lng: shop.longitude }
      bounds.extend(position)

      const marker = new window.google.maps.Marker({
        position,
        map: mapRef.current,
        title: shop.name,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8 + Math.min(Math.log(shop.check_in_count + 1) * 2, 8), // Size based on check-ins
          fillColor: shop.is_verified ? "#7c3aed" : "#6366f1", // Purple for verified, indigo for unverified
          fillOpacity: 0.9,
          strokeWeight: 2,
          strokeColor: "#ffffff",
        },
        animation: highlightedShopId === shop.id ? window.google.maps.Animation.BOUNCE : undefined,
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

    // If we have a highlighted shop, center on it
    if (highlightedShopId && markersRef.current[highlightedShopId]) {
      const highlightedMarker = markersRef.current[highlightedShopId]
      mapRef.current.setCenter(highlightedMarker.getPosition()!)
      mapRef.current.setZoom(15)

      // Trigger click on the marker to show info window
      window.google.maps.event.trigger(highlightedMarker, "click")

      // Find the shop and set it as selected
      const shop = shops.find((s) => s.id === highlightedShopId)
      if (shop) setSelectedShop(shop)
    }
    // Otherwise fit bounds to show all markers
    else if (Object.keys(markersRef.current).length > 0) {
      mapRef.current.fitBounds(bounds)

      // Don't zoom in too far on single markers
      const listener = window.google.maps.event.addListener(mapRef.current, "idle", () => {
        if (mapRef.current!.getZoom()! > 15) {
          mapRef.current!.setZoom(15)
        }
        window.google.maps.event.removeListener(listener)
      })
    }
  }, [shops, mapLoaded, highlightedShopId])

  // Get user's location
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser does not support geolocation",
        variant: "destructive",
      })
      return
    }

    setIsLoadingLocation(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const userLoc = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }
        setUserLocation(userLoc)

        if (mapRef.current && window.google) {
          mapRef.current.setCenter(userLoc)
          mapRef.current.setZoom(13)

          // Add a marker for the user's location
          new window.google.maps.Marker({
            position: userLoc,
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
        }

        setIsLoadingLocation(false)
      },
      (error) => {
        console.error("Error getting location:", error)
        toast({
          title: "Location error",
          description: "Could not get your location. Please check your browser permissions.",
          variant: "destructive",
        })
        setIsLoadingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    )
  }

  // Handle check-in
  const handleCheckIn = async (shopId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to check in to shops",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("shop_checkins").insert({
        shop_id: shopId,
        user_id: user.id,
      })

      if (error) throw error

      toast({
        title: "Checked in!",
        description: "You've successfully checked in to this shop",
      })

      // Update the local state to reflect the new check-in
      setSelectedShop((prev) => {
        if (prev && prev.id === shopId) {
          return {
            ...prev,
            check_in_count: prev.check_in_count + 1,
          }
        }
        return prev
      })
    } catch (error) {
      console.error("Error checking in:", error)
      toast({
        title: "Check-in failed",
        description: "There was an error checking in to this shop",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="relative h-[600px] w-full rounded-lg border overflow-hidden">
        {/* Google Maps will be loaded here */}
        <div ref={mapContainerRef} className="h-full w-full"></div>

        {!mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
          </div>
        )}

        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          <Button
            onClick={handleGetCurrentLocation}
            variant="secondary"
            size="sm"
            className="shadow-md"
            disabled={isLoadingLocation}
          >
            {isLoadingLocation ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <MapPin className="mr-2 h-4 w-4" />
                Find Nearby
              </>
            )}
          </Button>
        </div>

        {selectedShop && (
          <div className="absolute bottom-4 left-4 z-10 w-72">
            <Card className="shadow-lg">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-base">{selectedShop.name}</CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {selectedShop.city}
                  {selectedShop.state ? `, ${selectedShop.state}` : ""}
                  {selectedShop.is_verified && (
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      Verified
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{selectedShop.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Store className="h-4 w-4 text-purple-500" />
                    <span>{selectedShop.flavor_count} flavors</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    <span>{selectedShop.check_in_count} check-ins</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="p-3 pt-0 flex justify-between">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/dashboard/shops/${selectedShop.id}`}>
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Details
                  </Link>
                </Button>
                <Button size="sm" onClick={() => handleCheckIn(selectedShop.id)}>
                  <MapPin className="h-3 w-3 mr-1" />
                  Check In
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center space-x-1">
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-purple-600"></span>
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
                <Badge variant="outline" className="flex items-center space-x-1">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  <span>Your Location</span>
                </Badge>
                <Info className="h-4 w-4 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Your current location on the map</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="ml-auto text-sm text-muted-foreground">{shops.length} shops displayed on map</div>
      </div>
    </div>
  )
}
