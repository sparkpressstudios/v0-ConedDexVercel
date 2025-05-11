"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Loader2 } from "lucide-react"
import { MapsLoader } from "@/components/maps/maps-loader"
import { searchShops } from "@/app/actions/maps-actions"

// Declare google variable
declare global {
  interface Window {
    google?: any
  }
}

interface Shop {
  id: string
  name: string
  address: string
  rating?: number
  vicinity: string
  lat: number
  lng: number
}

// Export as a named export to maintain compatibility
export function PublicShopsMap() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [shops, setShops] = useState<Shop[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [infoWindow, setInfoWindow] = useState<any>(null)

  // Initialize the map when Google Maps is loaded
  const handleMapsLoaded = () => {
    if (!mapRef.current || !window.google) return

    // Create a new map instance
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 40.7128, lng: -74.006 }, // Default to NYC
      zoom: 12,
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
    })

    // Create an info window for displaying shop details
    const infoWindowInstance = new window.google.maps.InfoWindow()

    setMap(mapInstance)
    setInfoWindow(infoWindowInstance)

    // Load initial shops
    handleSearch("ice cream")
  }

  // Handle search form submission
  const handleSearch = async (query: string) => {
    if (!query) return

    setLoading(true)
    setSelectedShop(null)

    try {
      // Use the server action to search for shops
      const { results } = await searchShops(query)

      // Convert results to our shop format
      const formattedShops = results.map((result) => ({
        id: result.place_id,
        name: result.name,
        vicinity: result.vicinity,
        address: result.vicinity,
        rating: result.rating,
        lat: result.geometry.location.lat,
        lng: result.geometry.location.lng,
      }))

      setShops(formattedShops)

      // Update map bounds to fit all shops
      if (map && formattedShops.length > 0) {
        const bounds = new window.google.maps.LatLngBounds()
        formattedShops.forEach((shop) => {
          bounds.extend({ lat: shop.lat, lng: shop.lng })
        })
        map.fitBounds(bounds)

        // If only one result, zoom in a bit
        if (formattedShops.length === 1) {
          map.setZoom(15)
        }
      }
    } catch (error) {
      console.error("Error searching for shops:", error)
    } finally {
      setLoading(false)
    }
  }

  // Update markers when shops change
  useEffect(() => {
    if (!map || !window.google) return

    // Clear existing markers
    markers.forEach((marker) => marker.setMap(null))

    // Create new markers
    const newMarkers = shops.map((shop) => {
      const marker = new window.google.maps.Marker({
        position: { lat: shop.lat, lng: shop.lng },
        map,
        title: shop.name,
        animation: window.google.maps.Animation.DROP,
      })

      // Add click event to show info window
      marker.addListener("click", () => {
        setSelectedShop(shop)

        if (infoWindow) {
          infoWindow.setContent(`
            <div class="p-2">
              <h3 class="font-bold">${shop.name}</h3>
              <p class="text-sm">${shop.vicinity}</p>
              ${shop.rating ? `<p class="text-sm">Rating: ${shop.rating} ⭐</p>` : ""}
              <p class="text-sm mt-2">
                <a href="#" class="text-blue-600 hover:underline view-details" data-id="${shop.id}">
                  View Details
                </a>
              </p>
            </div>
          `)
          infoWindow.open(map, marker)
        }
      })

      return marker
    })

    setMarkers(newMarkers)
  }, [shops, map, infoWindow])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch(searchQuery)
  }

  // Get user's current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords

          if (map) {
            map.setCenter({ lat: latitude, lng: longitude })
            map.setZoom(14)

            // Add a special marker for user's location
            new window.google.maps.Marker({
              position: { lat: latitude, lng: longitude },
              map,
              title: "Your Location",
              icon: {
                path: window.google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "#4285F4",
                fillOpacity: 1,
                strokeColor: "#ffffff",
                strokeWeight: 2,
              },
            })

            // Search for shops near the user's location
            handleSearch("ice cream near me")
          }
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-200px)] min-h-[500px]">
      <Card className="md:col-span-1 overflow-auto">
        <CardHeader>
          <CardTitle>Find Ice Cream Shops</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-2">
              <Input
                placeholder="Search for ice cream shops..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={handleGetCurrentLocation}>
              <MapPin className="h-4 w-4 mr-2" /> Use My Location
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            <h3 className="font-medium">Results ({shops.length})</h3>
            {shops.length === 0 ? (
              <p className="text-sm text-gray-500">No shops found. Try a different search.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-auto">
                {shops.map((shop) => (
                  <Card
                    key={shop.id}
                    className={`p-3 cursor-pointer hover:bg-gray-50 ${
                      selectedShop?.id === shop.id ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => {
                      setSelectedShop(shop)

                      // Find the marker for this shop and trigger a click
                      const marker = markers.find((m) => m.getTitle() === shop.name)
                      if (marker) {
                        window.google.maps.event.trigger(marker, "click")

                        // Center the map on this marker
                        map.panTo(marker.getPosition())
                      }
                    }}
                  >
                    <h4 className="font-medium">{shop.name}</h4>
                    <p className="text-sm text-gray-500">{shop.vicinity}</p>
                    {shop.rating && <p className="text-sm">Rating: {shop.rating} ⭐</p>}
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="md:col-span-2 relative">
        <div ref={mapRef} className="w-full h-full min-h-[400px] rounded-md overflow-hidden">
          <MapsLoader onLoad={handleMapsLoaded} />
        </div>
      </Card>
    </div>
  )
}

// Also export as default for flexibility
export default PublicShopsMap
