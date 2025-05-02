"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, ArrowLeft, MapPin } from "lucide-react"
import { useRouter } from "next/navigation"
import { isMapsApiConfigured } from "@/app/api/maps/actions"

export default function ShopsMapPage() {
  const router = useRouter()
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isApiConfigured, setIsApiConfigured] = useState(false)

  useEffect(() => {
    // Check if Maps API is configured using server action
    async function checkMapsApi() {
      const configured = await isMapsApiConfigured()
      setIsApiConfigured(configured)

      if (configured) {
        // Simulate map loading
        const timer = setTimeout(() => {
          setIsMapLoaded(true)
        }, 1000)

        return () => clearTimeout(timer)
      }
    }

    checkMapsApi()
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // In a real implementation, we would search for shops here
    console.log("Searching for:", searchQuery)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shop Map</h1>
          <p className="text-muted-foreground">Find ice cream shops near you</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Ice Cream Shop Map</CardTitle>
              <CardDescription>Discover shops in your area</CardDescription>
            </div>
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
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <MapPin className="h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-center text-muted-foreground">
                  Map functionality will be displayed here
                  <br />
                  Google Maps API key is configured
                </p>
              </div>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                <MapPin className="h-16 w-16 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">Google Maps API key is required to display the map</p>
                <Button className="mt-4" variant="outline" onClick={() => router.push("/dashboard/shops")}>
                  Return to Shop List
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Nearby Shops</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Top Rated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Sweet Scoops</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Most Flavors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Glacier Delights</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Closest</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.8 miles</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
