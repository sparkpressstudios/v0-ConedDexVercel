"use client"

import type React from "react"

import { useState } from "react"
import { Search, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { geocodeAddress } from "@/lib/services/google-places-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

interface LocationSearchProps {
  onLocationSelected: (location: {
    address: string
    lat: number
    lng: number
    radius: number
  }) => void
}

export function LocationSearch({ onLocationSelected }: LocationSearchProps) {
  const [address, setAddress] = useState("")
  const [radius, setRadius] = useState(5)
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!address.trim()) {
      toast({
        title: "Address required",
        description: "Please enter a location to search",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)

    try {
      const result = await geocodeAddress(address)

      if (!result) {
        toast({
          title: "Location not found",
          description: "Could not find coordinates for this address",
          variant: "destructive",
        })
        return
      }

      onLocationSelected({
        address: result.formattedAddress,
        lat: result.lat,
        lng: result.lng,
        radius: radius * 1000, // Convert km to meters
      })

      toast({
        title: "Location selected",
        description: `Searching within ${radius}km of ${result.formattedAddress}`,
      })
    } catch (error) {
      console.error("Error geocoding address:", error)
      toast({
        title: "Error",
        description: "Failed to find this location. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search Location</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address">City, State or Address</Label>
            <div className="flex gap-2">
              <Input
                id="address"
                placeholder="e.g. Boston, MA or 123 Main St, Chicago, IL"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                disabled={isSearching}
              />
              <Button type="submit" disabled={isSearching || !address.trim()}>
                {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="radius">Search Radius: {radius} km</Label>
            </div>
            <Slider
              id="radius"
              min={1}
              max={50}
              step={1}
              value={[radius]}
              onValueChange={(value) => setRadius(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1km</span>
              <span>25km</span>
              <span>50km</span>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
