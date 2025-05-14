"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, IceCream } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"

export function ConeDexBrowser() {
  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchFlavors() {
      try {
        setLoading(true)
        const { data, error } = await supabase.from("flavors").select("*").order("name").limit(10)

        if (error) throw error
        setFlavors(data || [])
      } catch (error) {
        console.error("Error fetching flavors:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFlavors()
  }, [supabase])

  const filteredFlavors = flavors.filter((flavor) => flavor.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ConeDex Browser</CardTitle>
        <CardDescription>Explore ice cream flavors in our database</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-2 mb-4">
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
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
            <span className="sr-only">Filter</span>
          </Button>
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Flavors</TabsTrigger>
            <TabsTrigger value="popular">Popular</TabsTrigger>
            <TabsTrigger value="new">New</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
              </div>
            ) : filteredFlavors.length > 0 ? (
              filteredFlavors.map((flavor) => (
                <div key={flavor.id} className="flex items-center gap-3 p-3 rounded-lg border">
                  <div className="h-12 w-12 rounded-md bg-orange-100 flex items-center justify-center">
                    <IceCream className="h-6 w-6 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{flavor.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{flavor.category || "Classic"}</p>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/dashboard/flavors/${flavor.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <IceCream className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No flavors found</p>
              </div>
            )}
          </TabsContent>
          <TabsContent value="popular">
            <div className="text-center py-8">
              <p className="text-muted-foreground">Popular flavors coming soon</p>
            </div>
          </TabsContent>
          <TabsContent value="new">
            <div className="text-center py-8">
              <p className="text-muted-foreground">New flavors coming soon</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/flavors">View All Flavors</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default ConeDexBrowser
