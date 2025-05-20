"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { IceCream, Search, X, Star, TrendingUp, Clock, Heart } from "lucide-react"

interface MobileConeDexBrowserProps {
  userId?: string
}

export function MobileConeDexBrowser({ userId }: MobileConeDexBrowserProps) {
  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const supabase = createClient()

  useEffect(() => {
    async function fetchFlavors() {
      setLoading(true)

      try {
        // In a real implementation, you would fetch actual flavor data
        // This is a placeholder that simulates fetching data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock flavors data
        const mockFlavors = [
          {
            id: "1",
            name: "Vanilla Bean",
            description: "Classic vanilla bean ice cream",
            image_url: null,
            rating: 4.8,
            total_logs: 256,
            tags: ["classic", "vanilla", "creamy"],
            color: "#FFF9C4",
            icon_color: "#FBC02D",
          },
          {
            id: "2",
            name: "Chocolate Fudge",
            description: "Rich chocolate fudge ice cream",
            image_url: null,
            rating: 4.7,
            total_logs: 234,
            tags: ["chocolate", "rich", "fudge"],
            color: "#D7CCC8",
            icon_color: "#795548",
          },
          {
            id: "3",
            name: "Strawberry Swirl",
            description: "Strawberry ice cream with swirls of strawberry sauce",
            image_url: null,
            rating: 4.5,
            total_logs: 198,
            tags: ["fruit", "strawberry", "swirl"],
            color: "#FFCDD2",
            icon_color: "#E57373",
          },
          {
            id: "4",
            name: "Mint Chocolate Chip",
            description: "Mint ice cream with chocolate chips",
            image_url: null,
            rating: 4.6,
            total_logs: 210,
            tags: ["mint", "chocolate", "chip"],
            color: "#C8E6C9",
            icon_color: "#66BB6A",
          },
          {
            id: "5",
            name: "Cookies and Cream",
            description: "Vanilla ice cream with cookie pieces",
            image_url: null,
            rating: 4.9,
            total_logs: 278,
            tags: ["cookies", "vanilla", "creamy"],
            color: "#E0E0E0",
            icon_color: "#757575",
          },
          {
            id: "6",
            name: "Butter Pecan",
            description: "Buttery ice cream with pecan pieces",
            image_url: null,
            rating: 4.6,
            total_logs: 187,
            tags: ["nuts", "buttery", "pecan"],
            color: "#FFE0B2",
            icon_color: "#FF9800",
          },
          {
            id: "7",
            name: "Rocky Road",
            description: "Chocolate ice cream with marshmallows and nuts",
            image_url: null,
            rating: 4.7,
            total_logs: 203,
            tags: ["chocolate", "marshmallow", "nuts"],
            color: "#D7CCC8",
            icon_color: "#795548",
          },
          {
            id: "8",
            name: "Coffee",
            description: "Coffee-flavored ice cream",
            image_url: null,
            rating: 4.5,
            total_logs: 176,
            tags: ["coffee", "caffeine", "rich"],
            color: "#D7CCC8",
            icon_color: "#795548",
          },
          {
            id: "9",
            name: "Pistachio",
            description: "Pistachio-flavored ice cream with pistachio pieces",
            image_url: null,
            rating: 4.4,
            total_logs: 165,
            tags: ["nuts", "pistachio", "creamy"],
            color: "#DCEDC8",
            icon_color: "#8BC34A",
          },
          {
            id: "10",
            name: "Salted Caramel",
            description: "Caramel ice cream with a hint of salt",
            image_url: null,
            rating: 4.8,
            total_logs: 245,
            tags: ["caramel", "salty", "sweet"],
            color: "#FFE0B2",
            icon_color: "#FF9800",
          },
        ]

        setFlavors(mockFlavors)
      } catch (error) {
        console.error("Error fetching flavors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlavors()
  }, [supabase])

  // Filter flavors based on search query and active filters
  const filteredFlavors = flavors.filter((flavor) => {
    const matchesSearch =
      flavor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flavor.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      flavor.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilters = activeFilters.length === 0 || activeFilters.some((filter) => flavor.tags.includes(filter))

    return matchesSearch && matchesFilters
  })

  // Available filter tags
  const filterTags = [
    "classic",
    "vanilla",
    "chocolate",
    "fruit",
    "nuts",
    "creamy",
    "rich",
    "swirl",
    "chip",
    "marshmallow",
  ]

  // Toggle filter
  const toggleFilter = (filter: string) => {
    if (activeFilters.includes(filter)) {
      setActiveFilters(activeFilters.filter((f) => f !== filter))
    } else {
      setActiveFilters([...activeFilters, filter])
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-8 w-20 flex-shrink-0" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search flavors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
            onClick={() => setSearchQuery("")}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {filterTags.map((tag) => (
          <Badge
            key={tag}
            variant={activeFilters.includes(tag) ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => toggleFilter(tag)}
          >
            {tag}
          </Badge>
        ))}
        {activeFilters.length > 0 && (
          <Badge variant="secondary" className="cursor-pointer" onClick={() => setActiveFilters([])}>
            Clear All
          </Badge>
        )}
      </div>

      {/* Flavor Tabs */}
      <Tabs defaultValue="all">
        <TabsList className="w-full grid grid-cols-3">
          <TabsTrigger value="all">
            <IceCream className="h-4 w-4 mr-2" />
            All
          </TabsTrigger>
          <TabsTrigger value="popular">
            <TrendingUp className="h-4 w-4 mr-2" />
            Popular
          </TabsTrigger>
          <TabsTrigger value="recent">
            <Clock className="h-4 w-4 mr-2" />
            Recent
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            {filteredFlavors.length > 0 ? (
              filteredFlavors.map((flavor) => (
                <Link key={flavor.id} href={`/dashboard/flavors/${flavor.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-3">
                        <div
                          className="h-12 w-12 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: flavor.color,
                          }}
                        >
                          <IceCream
                            className="h-6 w-6"
                            style={{
                              color: flavor.icon_color,
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{flavor.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{flavor.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-xs">{flavor.rating}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{flavor.total_logs} logs</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="text-center py-8">
                <IceCream className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                <h3 className="font-medium mb-1">No flavors found</h3>
                <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            {filteredFlavors
              .sort((a, b) => b.total_logs - a.total_logs)
              .slice(0, 5)
              .map((flavor) => (
                <Link key={flavor.id} href={`/dashboard/flavors/${flavor.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-3">
                        <div
                          className="h-12 w-12 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: flavor.color,
                          }}
                        >
                          <IceCream
                            className="h-6 w-6"
                            style={{
                              color: flavor.icon_color,
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{flavor.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{flavor.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-xs">{flavor.rating}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{flavor.total_logs} logs</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="recent" className="mt-4">
          <div className="grid grid-cols-1 gap-3">
            {filteredFlavors
              .sort(() => Math.random() - 0.5) // Simulating recent flavors with random sort
              .slice(0, 5)
              .map((flavor) => (
                <Link key={flavor.id} href={`/dashboard/flavors/${flavor.id}`}>
                  <Card className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-0">
                      <div className="flex items-center gap-3 p-3">
                        <div
                          className="h-12 w-12 rounded-md flex items-center justify-center"
                          style={{
                            backgroundColor: flavor.color,
                          }}
                        >
                          <IceCream
                            className="h-6 w-6"
                            style={{
                              color: flavor.icon_color,
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium">{flavor.name}</h4>
                          <p className="text-xs text-muted-foreground line-clamp-1">{flavor.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="flex items-center">
                              <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                              <span className="text-xs">{flavor.rating}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">{flavor.total_logs} logs</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Heart className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
