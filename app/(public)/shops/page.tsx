"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List, Map, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import PublicShopsMap from "@/components/shop/public-shops-map"
import PublicShopsList from "@/components/shop/public-shops-list"
import ShopFilters from "@/components/shop/shop-filters"
import { useRouter, useSearchParams } from "next/navigation"

export default function ShopsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeView, setActiveView] = useState<"list" | "map">((searchParams.get("view") as "list" | "map") || "list")

  // Update URL when view changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("view", activeView)
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    router.push(`/shops?${params.toString()}`)
  }, [activeView, searchQuery, router, searchParams])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    if (searchQuery) {
      params.set("q", searchQuery)
    } else {
      params.delete("q")
    }
    params.set("view", activeView)
    router.push(`/shops?${params.toString()}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Discover Ice Cream Shops</h1>
        <p className="text-muted-foreground">
          Find and explore ice cream shops, see popular locations, and track your visits
        </p>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
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
          <Button type="submit">Search</Button>
        </form>

        <div className="flex items-center gap-2">
          <Tabs value={activeView} onValueChange={(v) => setActiveView(v as "list" | "map")} className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1">
                <Map className="h-4 w-4" />
                <span>Map</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="ml-2">
                <SlidersHorizontal className="h-4 w-4" />
                <span className="sr-only">Filters</span>
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filter Shops</SheetTitle>
                <SheetDescription>Refine your search with these filters</SheetDescription>
              </SheetHeader>
              <div className="py-4">
                <ShopFilters />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <div className="space-y-4">
        {activeView === "list" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Directory</CardTitle>
              <CardDescription>Browse all ice cream shops with check-in statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <PublicShopsList searchQuery={searchQuery} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Map</CardTitle>
              <CardDescription>View shops and check-ins on an interactive map</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <PublicShopsMap searchQuery={searchQuery} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
