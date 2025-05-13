"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List, Map } from "lucide-react"
import DashboardShopsMap from "@/components/shop/dashboard-shops-map"
import ShopsList from "@/components/shop/shops-list"

export default function ShopsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeView, setActiveView] = useState<"list" | "map">("list")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Search functionality will be handled by the child components
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Find Ice Cream Shops</h1>
        <p className="text-muted-foreground">Discover and explore ice cream shops in your area</p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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

        <div className="flex items-center space-x-2">
          <Button
            variant={activeView === "list" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("list")}
            className="flex items-center gap-1"
          >
            <List className="h-4 w-4" />
            <span>List</span>
          </Button>
          <Button
            variant={activeView === "map" ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveView("map")}
            className="flex items-center gap-1"
          >
            <Map className="h-4 w-4" />
            <span>Map</span>
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {activeView === "list" ? (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Directory</CardTitle>
              <CardDescription>Browse all ice cream shops in our database</CardDescription>
            </CardHeader>
            <CardContent>
              <ShopsList searchQuery={searchQuery} />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Shop Map</CardTitle>
              <CardDescription>View shops on an interactive map</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[600px] w-full">
                <DashboardShopsMap searchQuery={searchQuery} />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
