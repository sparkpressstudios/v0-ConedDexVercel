"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Search, Star, Store } from "lucide-react"
import { useCachedUserLogs, useCachedShops } from "@/hooks/use-cached-data"

// Demo data for visited shops
const demoVisitedShops = [
  {
    id: "shop1",
    name: "Sweet Scoops Ice Cream",
    address: "123 Main St, Anytown, USA",
    city: "Anytown",
    state: "CA",
    zip: "12345",
    rating: 4.8,
    review_count: 120,
    image_url: "https://images.unsplash.com/photo-1581932557745-0a5f0d33bb0c",
    visit_count: 5,
    last_visit: "2023-06-15T14:30:00Z",
    favorite_flavors: ["Vanilla Bean Dream", "Chocolate Fudge Brownie"],
  },
  {
    id: "shop2",
    name: "Frosty's Delights",
    address: "456 Oak Ave, Somewhere, USA",
    city: "Somewhere",
    state: "NY",
    zip: "67890",
    rating: 4.5,
    review_count: 85,
    image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    visit_count: 2,
    last_visit: "2023-06-05T12:15:00Z",
    favorite_flavors: ["Strawberry Fields"],
  },
  {
    id: "shop3",
    name: "Minty Fresh Ice Cream",
    address: "789 Pine St, Elsewhere, USA",
    city: "Elsewhere",
    state: "TX",
    zip: "54321",
    rating: 4.7,
    review_count: 95,
    image_url: "https://images.unsplash.com/photo-1505394033641-40c6ad1178d7",
    visit_count: 1,
    last_visit: "2023-05-28T15:20:00Z",
    favorite_flavors: ["Mint Chocolate Chip"],
  },
  {
    id: "shop4",
    name: "Cookie Monster's Creamery",
    address: "101 Sesame St, Cookieville, USA",
    city: "Cookieville",
    state: "IL",
    zip: "12121",
    rating: 4.9,
    review_count: 150,
    image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    visit_count: 3,
    last_visit: "2023-05-20T13:10:00Z",
    favorite_flavors: ["Cookie Dough Delight"],
  },
]

export default function VisitedShops({ userId, isDemoUser = false }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterState, setFilterState] = useState("all")
  const [visitedShops, setVisitedShops] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Use the cached data hooks
  const {
    data: userLogs,
    isLoading: logsLoading,
    error: logsError,
  } = useCachedUserLogs(isDemoUser ? undefined : userId)
  const { data: allShops, isLoading: shopsLoading, error: shopsError } = useCachedShops()

  useEffect(() => {
    // If we're using a demo user, set the demo data
    if (isDemoUser) {
      setVisitedShops(demoVisitedShops)
      setIsLoading(false)
      return
    }

    // If we're still loading data, wait
    if (logsLoading || shopsLoading) {
      setIsLoading(true)
      return
    }

    // If we have errors, use demo data
    if (logsError || shopsError) {
      console.error("Error loading data:", logsError || shopsError)
      setVisitedShops(demoVisitedShops)
      setIsLoading(false)
      return
    }

    // If we have both logs and shops data, process them
    if (userLogs && allShops) {
      try {
        // Process the data to get visited shops
        const processedShops = processShopData(userLogs, allShops)
        setVisitedShops(processedShops)
      } catch (err) {
        console.error("Error processing shop data:", err)
        setVisitedShops(demoVisitedShops)
      }
      setIsLoading(false)
    } else {
      // If we don't have data, use demo data
      setVisitedShops(demoVisitedShops)
      setIsLoading(false)
    }
  }, [isDemoUser, userLogs, allShops, logsLoading, shopsLoading, logsError, shopsError, userId])

  // Process the logs and shops data to get visited shops
  const processShopData = (logs, shops) => {
    // Create a map of shop IDs to shop data
    const shopMap = shops.reduce((acc, shop) => {
      acc[shop.id] = shop
      return acc
    }, {})

    // Group logs by shop
    const shopVisits = logs.reduce((acc, log) => {
      const shopId = log.shop_id
      if (!shopId) return acc

      if (!acc[shopId]) {
        acc[shopId] = {
          id: shopId,
          logs: [],
          visit_count: 0,
          last_visit: null,
          favorite_flavors: [],
        }
      }

      acc[shopId].logs.push(log)
      acc[shopId].visit_count += 1

      // Update last visit date if this log is more recent
      const visitDate = new Date(log.visit_date || log.created_at)
      if (!acc[shopId].last_visit || visitDate > new Date(acc[shopId].last_visit)) {
        acc[shopId].last_visit = log.visit_date || log.created_at
      }

      // Add flavor to favorite flavors if not already there
      if (log.flavors?.name && !acc[shopId].favorite_flavors.includes(log.flavors.name)) {
        acc[shopId].favorite_flavors.push(log.flavors.name)
      }

      return acc
    }, {})

    // Combine shop data with visit data
    return Object.keys(shopVisits).map((shopId) => {
      const shopData = shopMap[shopId] || {}
      const visitData = shopVisits[shopId]

      return {
        ...shopData,
        ...visitData,
        name: shopData.name || "Unknown Shop",
        address: shopData.address || "No address available",
        city: shopData.city || "",
        state: shopData.state || "",
        zip: shopData.zip || "",
        rating: shopData.rating || 0,
        review_count: shopData.review_count || 0,
        image_url: shopData.logo_url || shopData.cover_photo || "",
      }
    })
  }

  // Extract unique states from shops
  const states = ["all", ...new Set(visitedShops.map((shop) => shop.state).filter(Boolean))]

  // Apply filters and sorting
  const filteredShops = visitedShops
    .filter((shop) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch = shop.name?.toLowerCase().includes(query)
        const addressMatch = shop.address?.toLowerCase().includes(query)
        const cityMatch = shop.city?.toLowerCase().includes(query)

        if (!(nameMatch || addressMatch || cityMatch)) {
          return false
        }
      }

      // Apply state filter
      if (filterState !== "all" && shop.state !== filterState) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "recent":
          return new Date(b.last_visit).getTime() - new Date(a.last_visit).getTime()
        case "visits":
          return b.visit_count - a.visit_count
        case "rating":
          return b.rating - a.rating
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "")
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "")
        default:
          return 0
      }
    })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search shops..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterState} onValueChange={setFilterState}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by state" />
            </SelectTrigger>
            <SelectContent>
              {states.map((state) => (
                <SelectItem key={state} value={state}>
                  {state === "all" ? "All States" : state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent Visit</SelectItem>
              <SelectItem value="visits">Most Visits</SelectItem>
              <SelectItem value="rating">Highest Rated</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-muted animate-pulse" />
              <CardHeader>
                <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 bg-muted animate-pulse rounded" />
                  <div className="h-4 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredShops.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredShops.map((shop) => (
            <Card key={shop.id} className="overflow-hidden hover:shadow-md transition-shadow">
              <div className="relative h-40 bg-muted">
                {shop.image_url ? (
                  <img
                    src={shop.image_url || "/placeholder.svg"}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-100 to-indigo-200">
                    <Store className="h-16 w-16 text-blue-500" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Badge className="bg-blue-100 text-blue-800">
                    {shop.visit_count} {shop.visit_count === 1 ? "Visit" : "Visits"}
                  </Badge>
                </div>
              </div>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg">{shop.name}</CardTitle>
                  {shop.rating > 0 && (
                    <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                      <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                      <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5 mr-1.5" />
                  <span>{shop.address}</span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <span>Last visited: {new Date(shop.last_visit).toLocaleDateString()}</span>
                </div>
                {shop.favorite_flavors && shop.favorite_flavors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-xs text-muted-foreground mb-1">Favorite flavors:</p>
                    <div className="flex flex-wrap gap-1">
                      {shop.favorite_flavors.slice(0, 3).map((flavor) => (
                        <Badge key={flavor} variant="outline" className="text-xs">
                          {flavor}
                        </Badge>
                      ))}
                      {shop.favorite_flavors.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{shop.favorite_flavors.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" onClick={() => router.push(`/dashboard/shops/${shop.id}`)}>
                  View Shop Details
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Store className="h-16 w-16 text-blue-500 mb-4" />
          <h3 className="text-xl font-semibold">No shops found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || filterState !== "all"
              ? "No shops match your search criteria. Try adjusting your filters."
              : "You haven't visited any shops yet. Start your ice cream adventure!"}
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/shops")}>
            Explore Shops
          </Button>
        </div>
      )}
    </div>
  )
}
