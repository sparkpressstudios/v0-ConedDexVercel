"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, TrendingUp, Star, Clock } from "lucide-react"
import Link from "next/link"

interface ShopFlavorsOverviewProps {
  shopId: string
}

export function ShopFlavorsOverview({ shopId }: ShopFlavorsOverviewProps) {
  // This is a placeholder component - in a real implementation, you would fetch actual flavor data

  const mockFlavors = [
    {
      id: "1",
      name: "Vanilla Bean",
      description: "Classic vanilla bean ice cream",
      popularity: "High",
      rating: 4.8,
      last_updated: "2 days ago",
    },
    {
      id: "2",
      name: "Chocolate Fudge",
      description: "Rich chocolate fudge ice cream",
      popularity: "High",
      rating: 4.7,
      last_updated: "3 days ago",
    },
    {
      id: "3",
      name: "Strawberry Swirl",
      description: "Strawberry ice cream with swirls of strawberry sauce",
      popularity: "Medium",
      rating: 4.5,
      last_updated: "1 week ago",
    },
    {
      id: "4",
      name: "Mint Chocolate Chip",
      description: "Mint ice cream with chocolate chips",
      popularity: "Medium",
      rating: 4.6,
      last_updated: "5 days ago",
    },
    {
      id: "5",
      name: "Cookies and Cream",
      description: "Vanilla ice cream with cookie pieces",
      popularity: "High",
      rating: 4.9,
      last_updated: "1 day ago",
    },
  ]

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <CardTitle>Flavors Overview</CardTitle>
          <CardDescription>Manage your shop's flavors and see their performance</CardDescription>
        </div>
        <Button asChild>
          <Link href="/dashboard/shop/flavors/add">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add Flavor
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Flavors</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="recent">Recently Added</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-neutral-500 border-b">
                <div className="col-span-4">Name</div>
                <div className="col-span-3 hidden md:block">Description</div>
                <div className="col-span-2 text-center">Popularity</div>
                <div className="col-span-2 text-center">Rating</div>
                <div className="col-span-2 md:col-span-1 text-right">Updated</div>
              </div>
              {mockFlavors.map((flavor) => (
                <div key={flavor.id} className="grid grid-cols-12 p-4 text-sm border-b last:border-0 items-center">
                  <div className="col-span-4 font-medium">{flavor.name}</div>
                  <div className="col-span-3 hidden md:block text-muted-foreground truncate">{flavor.description}</div>
                  <div className="col-span-2 text-center">
                    <Badge variant={flavor.popularity === "High" ? "default" : "secondary"}>{flavor.popularity}</Badge>
                  </div>
                  <div className="col-span-2 text-center flex items-center justify-center">
                    <Star className="h-3 w-3 text-yellow-500 mr-1" />
                    {flavor.rating}
                  </div>
                  <div className="col-span-2 md:col-span-1 text-right text-muted-foreground flex items-center justify-end">
                    <Clock className="h-3 w-3 mr-1" />
                    {flavor.last_updated}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="popular" className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-neutral-500 border-b">
                <div className="col-span-4">Name</div>
                <div className="col-span-3 hidden md:block">Description</div>
                <div className="col-span-2 text-center">Popularity</div>
                <div className="col-span-2 text-center">Rating</div>
                <div className="col-span-2 md:col-span-1 text-right">Updated</div>
              </div>
              {mockFlavors
                .filter((f) => f.popularity === "High")
                .map((flavor) => (
                  <div key={flavor.id} className="grid grid-cols-12 p-4 text-sm border-b last:border-0 items-center">
                    <div className="col-span-4 font-medium">{flavor.name}</div>
                    <div className="col-span-3 hidden md:block text-muted-foreground truncate">
                      {flavor.description}
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge>{flavor.popularity}</Badge>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {flavor.rating}
                    </div>
                    <div className="col-span-2 md:col-span-1 text-right text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {flavor.last_updated}
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
          <TabsContent value="recent" className="space-y-4">
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 text-sm font-medium text-neutral-500 border-b">
                <div className="col-span-4">Name</div>
                <div className="col-span-3 hidden md:block">Description</div>
                <div className="col-span-2 text-center">Popularity</div>
                <div className="col-span-2 text-center">Rating</div>
                <div className="col-span-2 md:col-span-1 text-right">Updated</div>
              </div>
              {mockFlavors
                .sort((a, b) => {
                  if (a.last_updated.includes("day") && b.last_updated.includes("day")) {
                    return Number.parseInt(a.last_updated) - Number.parseInt(b.last_updated)
                  }
                  return a.last_updated.includes("day") ? -1 : 1
                })
                .slice(0, 3)
                .map((flavor) => (
                  <div key={flavor.id} className="grid grid-cols-12 p-4 text-sm border-b last:border-0 items-center">
                    <div className="col-span-4 font-medium">{flavor.name}</div>
                    <div className="col-span-3 hidden md:block text-muted-foreground truncate">
                      {flavor.description}
                    </div>
                    <div className="col-span-2 text-center">
                      <Badge variant={flavor.popularity === "High" ? "default" : "secondary"}>
                        {flavor.popularity}
                      </Badge>
                    </div>
                    <div className="col-span-2 text-center flex items-center justify-center">
                      <Star className="h-3 w-3 text-yellow-500 mr-1" />
                      {flavor.rating}
                    </div>
                    <div className="col-span-2 md:col-span-1 text-right text-muted-foreground flex items-center justify-end">
                      <Clock className="h-3 w-3 mr-1" />
                      {flavor.last_updated}
                    </div>
                  </div>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/dashboard/shop/flavors/catalog">View Catalog</Link>
        </Button>
        <Button asChild>
          <Link href="/dashboard/shop/flavors">
            <TrendingUp className="h-4 w-4 mr-2" />
            View All Flavors
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
