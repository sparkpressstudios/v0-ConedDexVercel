"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Filter, Store } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

// Demo shops data
const demoShops = [
  {
    id: "shop_1",
    name: "Sweet Scoops",
    address: "123 Main St, Anytown, CA",
    city: "Anytown",
    state: "CA",
    image_url: "/placeholder.svg?key=4fws5",
    rating: 4.8,
    flavor_count: 24,
    distance: 0.8,
  },
  {
    id: "shop_2",
    name: "Frosty's Parlor",
    address: "456 Elm St, Anytown, CA",
    city: "Anytown",
    state: "CA",
    image_url: "/placeholder.svg?key=qmk0h",
    rating: 4.5,
    flavor_count: 18,
    distance: 1.2,
  },
  {
    id: "shop_3",
    name: "Glacier Delights",
    address: "789 Oak Ave, Anytown, CA",
    city: "Anytown",
    state: "CA",
    image_url: "/placeholder.svg?key=c3lxu",
    rating: 4.7,
    flavor_count: 32,
    distance: 1.5,
  },
  {
    id: "shop_4",
    name: "Scoop Haven",
    address: "101 Pine Rd, Anytown, CA",
    city: "Anytown",
    state: "CA",
    image_url: "/placeholder.svg?key=y35vd",
    rating: 4.6,
    flavor_count: 22,
    distance: 2.3,
  },
]

export default function ShopsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [shops, setShops] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isDemoUser, setIsDemoUser] = useState(false)

  useEffect(() => {
    const checkDemoUser = () => {
      const demoUserEmail = document.cookie
        .split("; ")
        .find((row) => row.startsWith("conedex_demo_user="))
        ?.split("=")[1]

      if (demoUserEmail) {
        setIsDemoUser(true)
        setShops(demoShops)
        setLoading(false)
        return true
      }
      return false
    }

    const fetchShops = async () => {
      if (checkDemoUser()) return

      try {
        const { data, error } = await supabase.from("shops").select("*").order("name").limit(20)

        if (error) throw error

        setShops(data || [])
      } catch (error) {
        console.error("Error fetching shops:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShops()

    // Try to get user's location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }, [supabase])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Filter shops based on search query
    if (isDemoUser) {
      const filtered = demoShops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setShops(filtered)
    } else {
      // In a real app, we would fetch from the database with a filter
      // For now, just simulate filtering
      setLoading(true)
      setTimeout(() => {
        setLoading(false)
      }, 500)
    }
  }

  const filteredShops = searchQuery
    ? shops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.city?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : shops

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Find Ice Cream Shops</h1>
          <p className="text-muted-foreground">Discover ice cream shops near you</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/dashboard/shops/map")}>
          <MapPin className="mr-2 h-4 w-4" />
          View Map
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Search Shops</CardTitle>
          <CardDescription>Find shops by name, location, or flavor</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name, location, or flavor..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setLocation(null)}>
                <MapPin className="mr-2 h-4 w-4" />
                {location ? "Location Set" : "Use My Location"}
              </Button>
              <Button type="submit">Search</Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Filter className="mr-2 h-3 w-3" />
              Filter
            </Button>
            <Badge variant="outline" className="rounded-sm">
              Open Now
            </Badge>
            <Badge variant="outline" className="rounded-sm">
              Highest Rated
            </Badge>
            <Badge variant="outline" className="rounded-sm">
              Most Flavors
            </Badge>
          </div>
        </CardFooter>
      </Card>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          // Skeleton loaders
          Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardHeader className="pb-2">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))
        ) : filteredShops.length > 0 ? (
          filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden">
              <div className="relative h-48 w-full">
                <img
                  src={shop.image_url || "/placeholder.svg?height=192&width=384&query=ice cream shop"}
                  alt={shop.name}
                  className="h-full w-full object-cover"
                />
                {shop.distance && (
                  <Badge className="absolute right-2 top-2 bg-background/80">{shop.distance} miles away</Badge>
                )}
              </div>
              <CardHeader className="pb-2">
                <CardTitle className="line-clamp-1">{shop.name}</CardTitle>
                <CardDescription className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span className="line-clamp-1">{shop.address || `${shop.city || ""}, ${shop.state || ""}`}</span>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg
                      className="mr-1 h-4 w-4 fill-amber-400 text-amber-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    <span className="font-medium">{shop.rating || "New"}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">{shop.flavor_count || "?"} flavors available</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => router.push(`/dashboard/shops/${shop.id}`)}>
                  <Store className="mr-2 h-4 w-4" />
                  View Shop
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex h-40 flex-col items-center justify-center text-center">
            <Store className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">No shops found matching your search criteria</p>
          </div>
        )}
      </div>
    </div>
  )
}
