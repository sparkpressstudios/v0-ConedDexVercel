"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IceCream, Search, Star, Calendar, MapPin } from "lucide-react"
import { useCachedUserLogs } from "@/hooks/use-cached-data"
import { cn } from "@/lib/utils"

// Demo data for flavor logs
const demoFlavorLogs = [
  {
    id: "log1",
    flavor_id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    user_id: "user1",
    shop_id: "shop1",
    rating: 4.5,
    notes: "Absolutely delicious! The vanilla flavor was rich and creamy.",
    photo_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
    visit_date: "2023-06-15T14:30:00Z",
    created_at: "2023-06-15T14:30:00Z",
    flavors: {
      name: "Vanilla Bean Dream",
      base_type: "dairy",
      image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
      category: "classic",
      rarity: "common",
    },
    shops: {
      name: "Sweet Scoops Ice Cream",
      id: "shop1",
    },
  },
  {
    id: "log2",
    flavor_id: "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    user_id: "user1",
    shop_id: "shop1",
    rating: 5,
    notes: "The best chocolate ice cream I've ever had! Rich and fudgy.",
    photo_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
    visit_date: "2023-06-10T16:45:00Z",
    created_at: "2023-06-10T16:45:00Z",
    flavors: {
      name: "Chocolate Fudge Brownie",
      base_type: "dairy",
      image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
      category: "chocolate",
      rarity: "common",
    },
    shops: {
      name: "Sweet Scoops Ice Cream",
      id: "shop1",
    },
  },
  {
    id: "log3",
    flavor_id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    user_id: "user1",
    shop_id: "shop2",
    rating: 4,
    notes: "Very refreshing strawberry flavor with real fruit pieces.",
    photo_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
    visit_date: "2023-06-05T12:15:00Z",
    created_at: "2023-06-05T12:15:00Z",
    flavors: {
      name: "Strawberry Fields",
      base_type: "dairy",
      image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
      category: "fruit",
      rarity: "common",
    },
    shops: {
      name: "Frosty's Delights",
      id: "shop2",
    },
  },
]

// Rarity colors for badges
const rarityColors = {
  common: "bg-gray-100 text-gray-800",
  uncommon: "bg-green-100 text-green-800",
  rare: "bg-blue-100 text-blue-800",
  "ultra rare": "bg-purple-100 text-purple-800",
  legendary: "bg-amber-100 text-amber-800",
}

export default function PersonalFlavorCollection({ userId, isDemoUser = false }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("recent")
  const [filterCategory, setFilterCategory] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")

  // Use the cached data hook for real users
  const { data: userLogs, isLoading, error, refetch } = useCachedUserLogs(isDemoUser ? undefined : userId)

  // For demo users, use demo data
  const flavorLogs = isDemoUser ? demoFlavorLogs : userLogs || []

  // Extract unique categories from logs
  const categories = ["all", ...new Set(flavorLogs.map((log) => log.flavors?.category).filter(Boolean))]

  // Apply filters and sorting
  const filteredLogs = flavorLogs
    .filter((log) => {
      // Apply search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch = log.flavors?.name?.toLowerCase().includes(query)
        const shopMatch = log.shops?.name?.toLowerCase().includes(query)
        const notesMatch = log.notes?.toLowerCase().includes(query)

        if (!(nameMatch || shopMatch || notesMatch)) {
          return false
        }
      }

      // Apply category filter
      if (filterCategory !== "all" && log.flavors?.category !== filterCategory) {
        return false
      }

      return true
    })
    .sort((a, b) => {
      // Apply sorting
      switch (sortBy) {
        case "recent":
          return new Date(b.visit_date || b.created_at).getTime() - new Date(a.visit_date || a.created_at).getTime()
        case "rating-high":
          return (b.rating || 0) - (a.rating || 0)
        case "rating-low":
          return (a.rating || 0) - (b.rating || 0)
        case "name-asc":
          return (a.flavors?.name || "").localeCompare(b.flavors?.name || "")
        case "name-desc":
          return (b.flavors?.name || "").localeCompare(a.flavors?.name || "")
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
            placeholder="Search your flavors..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category === "all" ? "All Categories" : category.charAt(0).toUpperCase() + category.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="rating-high">Highest Rated</SelectItem>
              <SelectItem value="rating-low">Lowest Rated</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
            </SelectContent>
          </Select>

          <Tabs
            value={viewMode}
            onValueChange={(value) => setViewMode(value as "grid" | "list")}
            className="hidden md:block"
          >
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-grid-2x2"
                >
                  <rect width="18" height="18" x="3" y="3" rx="2" />
                  <path d="M3 12h18" />
                  <path d="M12 3v18" />
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-list"
                >
                  <line x1="8" x2="21" y1="6" y2="6" />
                  <line x1="8" x2="21" y1="12" y2="12" />
                  <line x1="8" x2="21" y1="18" y2="18" />
                  <line x1="3" x2="3.01" y1="6" y2="6" />
                  <line x1="3" x2="3.01" y1="12" y2="12" />
                  <line x1="3" x2="3.01" y1="18" y2="18" />
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {isLoading && !isDemoUser ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-48 bg-muted animate-pulse" />
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
      ) : filteredLogs.length > 0 ? (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
          }
        >
          {filteredLogs.map((log) => (
            <Card
              key={log.id}
              className={cn("overflow-hidden hover:shadow-md transition-shadow", viewMode === "list" ? "flex" : "")}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative h-48 bg-muted">
                    {log.photo_url || log.flavors?.image_url ? (
                      <img
                        src={log.photo_url || log.flavors?.image_url || "/placeholder.svg"}
                        alt={log.flavors?.name || "Ice cream flavor"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200">
                        <IceCream className="h-16 w-16 text-pink-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {log.flavors?.rarity && (
                        <Badge
                          className={
                            rarityColors[log.flavors.rarity as keyof typeof rarityColors] || rarityColors.common
                          }
                        >
                          {log.flavors.rarity}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <CardHeader>
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-lg">{log.flavors?.name || "Unknown Flavor"}</CardTitle>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{log.rating || "-"}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 mr-1.5" />
                      <span>{log.shops?.name || "Unknown Shop"}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1.5" />
                      <span>{new Date(log.visit_date || log.created_at).toLocaleDateString()}</span>
                    </div>
                    {log.notes && <p className="text-sm mt-2 line-clamp-2">{log.notes}</p>}
                    {log.flavors?.category && (
                      <Badge variant="outline" className="mt-1">
                        {log.flavors.category}
                      </Badge>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/flavors/${log.flavor_id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <div className="relative h-24 w-24 flex-shrink-0 bg-muted">
                    {log.photo_url || log.flavors?.image_url ? (
                      <img
                        src={log.photo_url || log.flavors?.image_url || "/placeholder.svg"}
                        alt={log.flavors?.name || "Ice cream flavor"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-100 to-purple-200">
                        <IceCream className="h-10 w-10 text-pink-500" />
                      </div>
                    )}
                    {log.flavors?.rarity && (
                      <Badge
                        className={`absolute bottom-1 right-1 text-xs ${
                          rarityColors[log.flavors.rarity as keyof typeof rarityColors] || rarityColors.common
                        }`}
                      >
                        {log.flavors.rarity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{log.flavors?.name || "Unknown Flavor"}</h3>
                        <div className="flex items-center text-xs text-muted-foreground mt-1">
                          <MapPin className="h-3 w-3 mr-1" />
                          <span>{log.shops?.name || "Unknown Shop"}</span>
                          <span className="mx-1.5 h-1 w-1 rounded-full bg-muted-foreground/30"></span>
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{new Date(log.visit_date || log.created_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center bg-amber-100 text-amber-800 px-2 py-1 rounded-md">
                        <Star className="h-3.5 w-3.5 mr-1 fill-amber-500 text-amber-500" />
                        <span className="text-sm font-medium">{log.rating || "-"}</span>
                      </div>
                    </div>
                    {log.notes && <p className="text-xs mt-2 line-clamp-2 text-muted-foreground">{log.notes}</p>}
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex gap-2">
                        {log.flavors?.base_type && (
                          <Badge variant="outline" className="text-xs">
                            {log.flavors.base_type}
                          </Badge>
                        )}
                        {log.flavors?.category && (
                          <Badge variant="secondary" className="text-xs">
                            {log.flavors.category}
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/dashboard/flavors/${log.flavor_id}`)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <IceCream className="h-16 w-16 text-pink-500 mb-4" />
          <h3 className="text-xl font-semibold">No flavors found</h3>
          <p className="text-muted-foreground mt-2">
            {searchQuery || filterCategory !== "all"
              ? "No flavors match your search criteria. Try adjusting your filters."
              : "You haven't logged any flavors yet. Start your ice cream adventure!"}
          </p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/log-flavor")}>
            Log Your First Flavor
          </Button>
        </div>
      )}
    </div>
  )
}
