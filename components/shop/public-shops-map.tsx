"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import ClientMapsLoader from "@/components/maps/client-maps-loader"
import { createClient } from "@/lib/supabase/client"

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
}

export default function PublicShopsMap() {
  const [shops, setShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const mapRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<{ [key: string]: google.maps.Marker }>({})
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null)
  const supabase = createClient()

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
          .eq("is_active", true)
          .order("rating", { ascending: false })

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

  // Initialize map when loaded
  const initMap = (mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance
    infoWindowRef.current = new google.maps.InfoWindow()

    // Add markers for shops
    shops.forEach((shop) => {
      if (!shop.latitude || !shop.longitude) return

      const marker = new google.maps.Marker({
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
              <p style="margin: 0 0 4px; font-size: 14px;">${shop.address}</p>
              <p style="margin: 0; font-size: 14px;">${shop.city}, ${shop.state} ${shop.zip}</p>
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
  }

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

  if (isLoading) {
    return (
      <div className="flex h-[500px] items-center justify-center rounded-lg border bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <Card className="overflow-hidden">
      <div className="relative h-[500px] w-full">
        <ClientMapsLoader onMapLoad={initMap} />

        <div className="absolute bottom-4 right-4 z-10">
          <Button onClick={handleGetCurrentLocation} variant="secondary">
            Find Shops Near Me
          </Button>
        </div>
      </div>
    </Card>
  )
}
