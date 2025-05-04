"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, SortAsc, SortDesc } from "lucide-react"
import Image from "next/image"

interface Flavor {
  id: string
  name: string
  description: string
  image_url: string
  category_id: string
  popularity: number
  dairy_free: boolean
  vegan: boolean
}

interface Category {
  id: string
  name: string
}

interface ConedexBrowserProps {
  initialFlavors: Flavor[]
  categories: Category[]
}

// Named export
export function ConedexBrowser({ initialFlavors, categories }: ConedexBrowserProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClientComponentClient()

  const [flavors, setFlavors] = useState<Flavor[]>(initialFlavors)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState<string>("all")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [filterDairyFree, setFilterDairyFree] = useState(false)
  const [filterVegan, setFilterVegan] = useState(false)

  useEffect(() => {
    async function fetchFlavors() {
      setLoading(true)

      let query = supabase.from("flavors").select("*")

      // Apply search filter
      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`)
      }

      // Apply category filter
      if (activeCategory !== "all") {
        query = query.eq("category_id", activeCategory)
      }

      // Apply dietary filters
      if (filterDairyFree) {
        query = query.eq("dairy_free", true)
      }

      if (filterVegan) {
        query = query.eq("vegan", true)
      }

      // Apply sorting
      query = query.order("name", { ascending: sortOrder === "asc" })

      const { data, error } = await query

      if (error) {
        console.error("Error fetching flavors:", error)
      } else {
        setFlavors(data || [])
      }

      setLoading(false)
    }

    fetchFlavors()
  }, [searchQuery, activeCategory, sortOrder, filterDairyFree, filterVegan, supabase])

  const handleFlavorClick = (flavorId: string) => {
    // Update URL with the selected flavor ID
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", flavorId)
    router.push(`/dashboard/flavors?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
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
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            title={sortOrder === "asc" ? "Sort Descending" : "Sort Ascending"}
          >
            {sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
          </Button>
          <Button
            variant={filterDairyFree ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterDairyFree(!filterDairyFree)}
          >
            Dairy Free
          </Button>
          <Button variant={filterVegan ? "default" : "outline"} size="sm" onClick={() => setFilterVegan(!filterVegan)}>
            Vegan
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category.id} value={category.id}>
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeCategory} className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-0">
                    <Skeleton className="h-[120px] w-full rounded-t-lg" />
                    <div className="p-4">
                      <Skeleton className="h-5 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full mb-1" />
                      <Skeleton className="h-4 w-2/3" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : flavors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No flavors found</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  setSearchQuery("")
                  setActiveCategory("all")
                  setFilterDairyFree(false)
                  setFilterVegan(false)
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {flavors.map((flavor) => (
                <Card
                  key={flavor.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => handleFlavorClick(flavor.id)}
                >
                  <CardContent className="p-0">
                    <div className="relative h-[120px] w-full overflow-hidden rounded-t-lg">
                      {flavor.image_url ? (
                        <Image
                          src={flavor.image_url || "/placeholder.svg"}
                          alt={flavor.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="h-full w-full bg-muted flex items-center justify-center">
                          <span className="text-muted-foreground text-sm">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium mb-1">{flavor.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {flavor.description || "No description available"}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {flavor.dairy_free && (
                          <Badge variant="outline" className="text-xs">
                            Dairy Free
                          </Badge>
                        )}
                        {flavor.vegan && (
                          <Badge variant="outline" className="text-xs">
                            Vegan
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Default export (re-exporting the named export)
export default ConedexBrowser
