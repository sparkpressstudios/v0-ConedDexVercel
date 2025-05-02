"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, IceCream, Filter, X, Grid, List, Heart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

// Demo data for ConeDex
const demoFlavors = [
  {
    id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Vanilla Bean Dream",
    description: "Rich vanilla bean ice cream with real Madagascar vanilla beans.",
    base_type: "dairy",
    category: "classic",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
    shop_name: "Sweet Scoops Ice Cream",
    rating: 4.5,
    is_favorite: false,
    tags: ["vanilla", "creamy", "classic"],
  },
  {
    id: "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Chocolate Fudge Brownie",
    description: "Decadent chocolate ice cream with fudge swirls and brownie chunks.",
    base_type: "dairy",
    category: "chocolate",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
    shop_name: "Sweet Scoops Ice Cream",
    rating: 4.8,
    is_favorite: true,
    tags: ["chocolate", "fudge", "brownie"],
  },
  {
    id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Strawberry Fields",
    description: "Fresh strawberry ice cream with real strawberry pieces.",
    base_type: "dairy",
    category: "fruit",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
    shop_name: "Sweet Scoops Ice Cream",
    rating: 4.6,
    is_favorite: false,
    tags: ["strawberry", "fruit", "refreshing"],
  },
  {
    id: "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Mint Chocolate Chip",
    description: "Refreshing mint ice cream with chocolate chips throughout.",
    base_type: "dairy",
    category: "classic",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b",
    shop_name: "Frosty's Delights",
    rating: 4.7,
    is_favorite: true,
    tags: ["mint", "chocolate", "refreshing"],
  },
  {
    id: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Salted Caramel Swirl",
    description: "Creamy vanilla ice cream with ribbons of salted caramel.",
    base_type: "dairy",
    category: "gourmet",
    rarity: "uncommon",
    image_url:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b",
    shop_name: "Frosty's Delights",
    rating: 4.9,
    is_favorite: false,
    tags: ["caramel", "salty", "sweet"],
  },
  {
    id: "f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    name: "Blueberry Cheesecake",
    description: "Cheesecake ice cream with blueberry swirls and graham cracker pieces.",
    base_type: "dairy",
    category: "dessert",
    rarity: "rare",
    image_url:
      "https://images.unsplash.com/photo-1587563974553-d6c0fbbbcce5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
    shop_name: "Gelato Gems",
    rating: 4.4,
    is_favorite: true,
    tags: ["blueberry", "cheesecake", "graham cracker"],
  },
  {
    id: "a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Mango Sorbet",
    description: "Refreshing dairy-free sorbet made with ripe mangoes.",
    base_type: "sorbet",
    category: "fruit",
    rarity: "uncommon",
    image_url:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
    shop_name: "Gelato Gems",
    rating: 4.3,
    is_favorite: false,
    tags: ["mango", "sorbet", "dairy-free"],
  },
  {
    id: "b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    name: "Lavender Honey",
    description: "Delicate lavender-infused ice cream sweetened with local honey.",
    base_type: "dairy",
    category: "floral",
    rarity: "legendary",
    image_url:
      "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    shop_id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
    shop_name: "Artisanal Scoops",
    rating: 4.2,
    is_favorite: true,
    tags: ["lavender", "honey", "floral"],
  },
]

// Demo user types
const demoUsers = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
  },
}

export default function ConeDexBrowser({
  personalOnly = false,
  isDemoUser = false,
  demoUserEmail = null,
}: {
  personalOnly?: boolean
  isDemoUser?: boolean
  demoUserEmail?: string | null
}) {
  const router = useRouter()
  const supabase = createClient()

  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [rarityFilter, setRarityFilter] = useState<string | null>(null)
  const [baseTypeFilter, setBaseTypeFilter] = useState<string | null>(null)
  const [minRating, setMinRating] = useState([0])
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)

  const [categories, setCategories] = useState<string[]>([])
  const [rarities, setRarities] = useState<string[]>([])
  const [baseTypes, setBaseTypes] = useState<string[]>([])

  useEffect(() => {
    if (isDemoUser) {
      // Use demo data for demo users
      setLoading(true)

      // Filter demo flavors based on personalOnly
      let filteredFlavors = [...demoFlavors]

      if (personalOnly && demoUserEmail) {
        // For personal view, only show flavors for the current demo user
        // For demo purposes, we'll just show a subset
        filteredFlavors = demoFlavors.slice(0, 3)
      }

      // Extract filter options from demo data
      const allCategories = [...new Set(filteredFlavors.map((item) => item.category).filter(Boolean))]
      const allRarities = [...new Set(filteredFlavors.map((item) => item.rarity).filter(Boolean))]
      const allBaseTypes = [...new Set(filteredFlavors.map((item) => item.base_type).filter(Boolean))]

      setFlavors(filteredFlavors)
      setCategories(allCategories)
      setRarities(allRarities)
      setBaseTypes(allBaseTypes)
      setLoading(false)
    } else {
      // Use real data for authenticated users
      fetchFlavors()
    }
  }, [personalOnly, categoryFilter, rarityFilter, baseTypeFilter, isDemoUser, demoUserEmail])

  const fetchFlavors = async () => {
    setLoading(true)
    try {
      let query = supabase.from("flavors").select(`
        *,
        flavor_logs!inner (
          id,
          user_id,
          rating,
          photo_url,
          created_at
        )
      `)

      if (personalOnly) {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (user) {
          query = query.eq("flavor_logs.user_id", user.id)
        }
      }

      if (categoryFilter) {
        query = query.eq("category", categoryFilter)
      }

      if (rarityFilter) {
        query = query.eq("rarity", rarityFilter)
      }

      if (baseTypeFilter) {
        query = query.eq("base_type", baseTypeFilter)
      }

      const { data, error } = await query

      if (error) throw error

      // Group by flavor and get unique flavors
      const uniqueFlavors = Array.from(new Map(data.map((item) => [item.id, item])).values())

      setFlavors(uniqueFlavors)

      // Extract filter options
      const allCategories = [...new Set(data.map((item) => item.category).filter(Boolean))]
      const allRarities = [...new Set(data.map((item) => item.rarity).filter(Boolean))]
      const allBaseTypes = [...new Set(data.map((item) => item.base_type).filter(Boolean))]

      setCategories(allCategories)
      setRarities(allRarities)
      setBaseTypes(allBaseTypes)
    } catch (error) {
      console.error("Error fetching flavors:", error)
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = async (flavorId: string) => {
    if (isDemoUser) {
      // For demo users, just update the UI state
      setFlavors((prevFlavors) =>
        prevFlavors.map((flavor) =>
          flavor.id === flavorId ? { ...flavor, is_favorite: !flavor.is_favorite } : flavor,
        ),
      )
    } else {
      // For real users, update in the database
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: existingFavorite } = await supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("flavor_id", flavorId)
          .single()

        if (existingFavorite) {
          // Remove from favorites
          await supabase.from("user_favorites").delete().eq("id", existingFavorite.id)
        } else {
          // Add to favorites
          await supabase.from("user_favorites").insert({ user_id: user.id, flavor_id: flavorId })
        }

        // Update local state
        setFlavors((prevFlavors) =>
          prevFlavors.map((flavor) =>
            flavor.id === flavorId ? { ...flavor, is_favorite: !flavor.is_favorite } : flavor,
          ),
        )
      } catch (error) {
        console.error("Error toggling favorite:", error)
      }
    }
  }

  const filteredFlavors = flavors.filter((flavor) => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const nameMatch = flavor.name?.toLowerCase().includes(query)
      const descMatch = flavor.description?.toLowerCase().includes(query)
      const shopMatch = flavor.shop_name?.toLowerCase().includes(query)
      const tagsMatch = flavor.tags?.some((tag: string) => tag.toLowerCase().includes(query))

      if (!(nameMatch || descMatch || shopMatch || tagsMatch)) {
        return false
      }
    }

    // Apply rating filter
    if (minRating[0] > 0 && flavor.rating < minRating[0]) {
      return false
    }

    // Apply favorites filter
    if (showFavoritesOnly && !flavor.is_favorite) {
      return false
    }

    return true
  })

  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case "common":
        return "bg-gray-200 text-gray-800"
      case "uncommon":
        return "bg-mint-200 text-mint-800"
      case "rare":
        return "bg-blueberry-200 text-blueberry-800"
      case "ultra rare":
      case "legendary":
        return "bg-strawberry-200 text-strawberry-800"
      default:
        return "bg-gray-200 text-gray-800"
    }
  }

  const clearFilters = () => {
    setSearchQuery("")
    setCategoryFilter(null)
    setRarityFilter(null)
    setBaseTypeFilter(null)
    setMinRating([0])
    setShowFavoritesOnly(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search flavors..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Popover open={showFilters} onOpenChange={setShowFilters}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="hidden sm:inline">Filters</span>
                  {(categoryFilter || rarityFilter || baseTypeFilter || minRating[0] > 0 || showFavoritesOnly) && (
                    <Badge className="ml-1 rounded-full px-1 py-0" variant="secondary">
                      {
                        [
                          categoryFilter && 1,
                          rarityFilter && 1,
                          baseTypeFilter && 1,
                          minRating[0] > 0 && 1,
                          showFavoritesOnly && 1,
                        ].filter(Boolean).length
                      }
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Filters</h3>
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Clear all
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
                      <SelectTrigger id="category">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rarity">Rarity</Label>
                    <Select value={rarityFilter || ""} onValueChange={(value) => setRarityFilter(value || null)}>
                      <SelectTrigger id="rarity">
                        <SelectValue placeholder="All Rarities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Rarities</SelectItem>
                        {rarities.map((rarity) => (
                          <SelectItem key={rarity} value={rarity}>
                            {rarity}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseType">Base Type</Label>
                    <Select value={baseTypeFilter || ""} onValueChange={(value) => setBaseTypeFilter(value || null)}>
                      <SelectTrigger id="baseType">
                        <SelectValue placeholder="All Base Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Base Types</SelectItem>
                        {baseTypes.map((baseType) => (
                          <SelectItem key={baseType} value={baseType}>
                            {baseType}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="minRating">Minimum Rating</Label>
                      <span className="text-sm">{minRating[0]}/5</span>
                    </div>
                    <Slider id="minRating" min={0} max={5} step={0.5} value={minRating} onValueChange={setMinRating} />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="favorites"
                      checked={showFavoritesOnly}
                      onCheckedChange={(checked) => setShowFavoritesOnly(checked as boolean)}
                    />
                    <Label htmlFor="favorites">Show favorites only</Label>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center rounded-md border">
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-none rounded-l-md",
                  viewMode === "grid" ? "bg-muted hover:bg-muted" : "hover:bg-transparent",
                )}
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
                <span className="sr-only">Grid view</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "rounded-none rounded-r-md",
                  viewMode === "list" ? "bg-muted hover:bg-muted" : "hover:bg-transparent",
                )}
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
                <span className="sr-only">List view</span>
              </Button>
            </div>
          </div>
        </div>

        {(categoryFilter || rarityFilter || baseTypeFilter || minRating[0] > 0 || showFavoritesOnly) && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Active filters:</span>
            {categoryFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Category: {categoryFilter}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setCategoryFilter(null)} />
              </Badge>
            )}
            {rarityFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rarity: {rarityFilter}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setRarityFilter(null)} />
              </Badge>
            )}
            {baseTypeFilter && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Base: {baseTypeFilter}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setBaseTypeFilter(null)} />
              </Badge>
            )}
            {minRating[0] > 0 && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Rating: ≥{minRating[0]}
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setMinRating([0])} />
              </Badge>
            )}
            {showFavoritesOnly && (
              <Badge variant="secondary" className="flex items-center gap-1">
                Favorites only
                <X className="ml-1 h-3 w-3 cursor-pointer" onClick={() => setShowFavoritesOnly(false)} />
              </Badge>
            )}
            <Button variant="ghost" size="sm" onClick={clearFilters} className="h-7 px-2 text-xs">
              Clear all
            </Button>
          </div>
        )}
      </div>

      {loading ? (
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
      ) : filteredFlavors.length > 0 ? (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" : "flex flex-col gap-4"
          }
        >
          {filteredFlavors.map((flavor) => (
            <Card
              key={flavor.id}
              className={cn("overflow-hidden hover:shadow-lg transition-shadow", viewMode === "list" ? "flex" : "")}
            >
              {viewMode === "grid" ? (
                <>
                  <div className="relative h-48 bg-muted">
                    {flavor.image_url ? (
                      <img
                        src={flavor.image_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : flavor.flavor_logs?.[0]?.photo_url ? (
                      <img
                        src={flavor.flavor_logs[0].photo_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint-100 to-blueberry-200">
                        <IceCream className="h-16 w-16 text-mint-500" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-1">
                      {flavor.rarity && <Badge className={getRarityColor(flavor.rarity)}>{flavor.rarity}</Badge>}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full bg-background/80 hover:bg-background"
                        onClick={() => toggleFavorite(flavor.id)}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            flavor.is_favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground",
                          )}
                        />
                        <span className="sr-only">
                          {flavor.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      <span>{flavor.name}</span>
                      {flavor.base_type && <Badge variant="outline">{flavor.base_type}</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {flavor.description || "No description available"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {flavor.category && (
                        <Badge variant="secondary" className="mr-1">
                          {flavor.category}
                        </Badge>
                      )}
                      {flavor.tags &&
                        flavor.tags.map((tag: string) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                    </div>
                    <div className="mt-2 flex items-center text-sm">
                      <Star className="h-4 w-4 text-amber-500 mr-1" />
                      <span className="font-medium">{flavor.rating || 0}</span>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{flavor.shop_name}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => router.push(`/dashboard/flavors/${flavor.id}`)}
                    >
                      View Details
                    </Button>
                  </CardFooter>
                </>
              ) : (
                <>
                  <div className="relative h-32 w-32 flex-shrink-0 bg-muted">
                    {flavor.image_url ? (
                      <img
                        src={flavor.image_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : flavor.flavor_logs?.[0]?.photo_url ? (
                      <img
                        src={flavor.flavor_logs[0].photo_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint-100 to-blueberry-200">
                        <IceCream className="h-10 w-10 text-mint-500" />
                      </div>
                    )}
                    {flavor.rarity && (
                      <Badge className={`absolute bottom-2 left-2 ${getRarityColor(flavor.rarity)}`}>
                        {flavor.rarity}
                      </Badge>
                    )}
                  </div>
                  <div className="flex flex-col flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">{flavor.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {flavor.description || "No description available"}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() => toggleFavorite(flavor.id)}
                      >
                        <Heart
                          className={cn(
                            "h-4 w-4",
                            flavor.is_favorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground",
                          )}
                        />
                        <span className="sr-only">
                          {flavor.is_favorite ? "Remove from favorites" : "Add to favorites"}
                        </span>
                      </Button>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {flavor.base_type && <Badge variant="outline">{flavor.base_type}</Badge>}
                      {flavor.category && (
                        <Badge variant="secondary" className="mr-1">
                          {flavor.category}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-auto pt-2 flex items-center justify-between">
                      <div className="flex items-center text-sm">
                        <Star className="h-4 w-4 text-amber-500 mr-1" />
                        <span className="font-medium">{flavor.rating || 0}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <span className="text-muted-foreground">{flavor.shop_name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/flavors/${flavor.id}`)}
                      >
                        View Details
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
          <IceCream className="h-16 w-16 text-mint-500 mb-4" />
          <h3 className="text-xl font-semibold">No flavors found</h3>
          <p className="text-muted-foreground mt-2">
            {personalOnly
              ? "You haven't logged any flavors yet. Start your ice cream adventure!"
              : "No flavors match your search criteria. Try adjusting your filters."}
          </p>
          {personalOnly && (
            <Button className="mt-4" onClick={() => router.push("/dashboard/log-flavor")}>
              Log Your First Flavor
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
