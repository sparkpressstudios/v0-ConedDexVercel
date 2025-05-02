"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Filter } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { isMapsApiConfigured, searchShopsNearLocation } from "@/app/api/maps/actions"

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

export function PublicShopsMap() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const supabase = createClient()

  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [shops, setShops] = useState<Shop[]>([])
  const [filteredShops, setFilteredShops] = useState<Shop[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null)
  const [mapInstance, setMapInstance] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isApiConfigured, setIsApiConfigured] = useState(false)

  // Filter states
  const [showFilters, setShowFilters] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [maxDistance, setMaxDistance] = useState(50) // miles
  const [onlyVerified, setOnlyVerified] = useState(false)
  const [minFlavors, setMinFlavors] = useState(0)

  // Fetch shops data
  useEffect(() => {
    async function fetchShops() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("shops").select("*")

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

  // Initialize map
  useEffect(() => {
    // Check if Maps API is configured using server action
    async function checkMapsApi() {
      const configured = await isMapsApiConfigured()
      setIsApiConfigured(configured)

      if (configured) {
        // Simulate map loading
        const timer = setTimeout(() => {
          setIsMapLoaded(true)
          // Simulate map instance
          setMapInstance({})
        }, 1000)

        return () => clearTimeout(timer)
      }
    }

    checkMapsApi()

    // Try to get user location
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

  // Apply filters
  const applyFilters = useCallback(async () => {
    if (!user) {
      setShowAuthPrompt(true)
      return
    }

    let filtered = [...shops]

    // Apply search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (shop) =>
          shop.name.toLowerCase().includes(query) ||
          shop.city.toLowerCase().includes(query) ||
          shop.state.toLowerCase().includes(query),
      )
    }

    // Apply rating filter
    if (minRating > 0) {
      filtered = filtered.filter((shop) => shop.rating >= minRating)
    }

    // Apply verified filter
    if (onlyVerified) {
      filtered = filtered.filter((shop) => shop.is_verified)
    }

    // Apply flavor count filter
    if (minFlavors > 0) {
      filtered = filtered.filter((shop) => shop.flavor_count >= minFlavors)
    }

    // Apply distance filter if user location is available
    if (userLocation && maxDistance < 50) {
      // Use server action to filter by distance
      const nearbyShops = await searchShopsNearLocation(
        userLocation.lat,
        userLocation.lng,
        maxDistance * 1000, // Convert miles to meters
      )

      // Get IDs of nearby shops
      const nearbyShopIds = new Set(nearbyShops.map((shop) => shop.id))

      // Filter the shops
      filtered = filtered.filter((shop) => nearbyShopIds.has(shop.id))
    }

    setFilteredShops(filtered)
  }, [shops, searchQuery, minRating, onlyVerified, minFlavors, maxDistance, userLocation, user])

  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    applyFilters()
  }

  // Handle shop selection
  const handleShopSelect = (shop: Shop) => {
    if (!user) {
      setSelectedShop(shop)
      setShowAuthPrompt(true)
      return
    }

    router.push(`/shops/${shop.id}`)
  }

  // Reset filters
  const resetFilters = () => {
    setSearchQuery("")
    setMinRating(0)
    setMaxDistance(50)
    setOnlyVerified(false)
    setMinFlavors(0)
    setFilteredShops(shops)
  }

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
                {filteredShops.length} shops available
                {userLocation && <span className="ml-2">(Location detected)</span>}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search locations..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Button type="submit">Search</Button>
              </form>

              <Popover open={showFilters} onOpenChange={setShowFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon" className="relative">
                    <Filter className="h-4 w-4" />
                    {(minRating > 0 || maxDistance < 50 || onlyVerified || minFlavors > 0) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80">
                  <div className="space-y-4">
                    <h4 className="font-medium">Filter Shops</h4>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="min-rating">Minimum Rating</Label>
                        <span>{minRating} ★</span>
                      </div>
                      <Slider
                        id="min-rating"
                        min={0}
                        max={5}
                        step={0.5}
                        value={[minRating]}
                        onValueChange={(value) => setMinRating(value[0])}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="max-distance">Max Distance</Label>
                        <span>{maxDistance} miles</span>
                      </div>
                      <Slider
                        id="max-distance"
                        min={1}
                        max={50}
                        step={1}
                        value={[maxDistance]}
                        onValueChange={(value) => setMaxDistance(value[0])}
                        disabled={!userLocation}
                      />
                      {!userLocation && (
                        <p className="text-xs text-muted-foreground">Enable location to use distance filter</p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="verified-only"
                        checked={onlyVerified}
                        onCheckedChange={(checked) => setOnlyVerified(checked === true)}
                      />
                      <Label htmlFor="verified-only">Verified shops only</Label>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor="min-flavors">Minimum Flavors</Label>
                        <span>{minFlavors}</span>
                      </div>
                      <Slider
                        id="min-flavors"
                        min={0}
                        max={50}
                        step={5}
                        value={[minFlavors]}
                        onValueChange={(value) => setMinFlavors(value[0])}
                      />
                    </div>

                    <div className="flex justify-between">
                      <Button variant="outline" size="sm" onClick={resetFilters}>
                        Reset
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => {
                          setShowFilters(false)
                          applyFilters()
                        }}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
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
            ) : isApiConfigured ? (
              <div className="absolute inset-0">
                {/* This would be replaced with an actual Google Map */}
                <div className="h-full w-full bg-slate-100 flex items-center justify-center">
                  <div className="text-center p-4">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <h3 className="text-xl font-bold mb-2">Map Visualization</h3>
                    <p className="mb-4">{filteredShops.length} shops would be displayed here on the map</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {filteredShops.slice(0, 5).map((shop) => (
                        <Badge
                          key={shop.id}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => handleShopSelect(shop)}
                        >
                          {shop.name}
                        </Badge>
                      ))}
                      {filteredShops.length > 5 && <Badge variant="outline">+{filteredShops.length - 5} more</Badge>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-xl font-bold mb-2">Maps API Not Configured</h3>
                <p className="mb-4 max-w-md text-muted-foreground">
                  The Google Maps API key is not configured. Please add it to your environment variables to enable the
                  map functionality.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Shop List */}
      <Card>
        <CardHeader>
          <CardTitle>Nearby Ice Cream Shops</CardTitle>
          <CardDescription>
            {filteredShops.length === 0
              ? "No shops found matching your criteria"
              : `${filteredShops.length} shops found`}
          </CardDescription>
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
            ) : filteredShops.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <p className="text-muted-foreground">No shops found matching your criteria</p>
                <Button variant="outline" className="mt-4" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            ) : (
              filteredShops.map((shop) => (
                <div
                  key={shop.id}
                  className="flex items-start space-x-4 rounded-lg border p-4 transition-colors hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleShopSelect(shop)}
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

      {/* Auth Prompt Dialog would be implemented here */}
    </div>
  )
}
