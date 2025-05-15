"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client-browser"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Grid, List, Calendar } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

// Demo data for flavor collection
const DEMO_FLAVORS = [
  {
    id: "1",
    name: "Chocolate",
    image_url: "/chocolate-ice-cream-scoop.png",
    rating: 4.5,
    shop_name: "Scoops Delight",
    date_logged: "2023-05-15",
  },
  {
    id: "2",
    name: "Strawberry",
    image_url: "/strawberry-ice-cream-scoop.png",
    rating: 4.2,
    shop_name: "Berry Good Ice Cream",
    date_logged: "2023-06-02",
  },
  {
    id: "3",
    name: "Mint Chocolate Chip",
    image_url: "/mint-chocolate-chip-scoop.png",
    rating: 4.8,
    shop_name: "Minty Fresh",
    date_logged: "2023-06-10",
  },
  {
    id: "4",
    name: "Cookies and Cream",
    image_url: "/cookies-and-cream-scoop.png",
    rating: 4.7,
    shop_name: "Cookie Monster",
    date_logged: "2023-06-15",
  },
  {
    id: "5",
    name: "Mango Sorbet",
    image_url: "/mango-sorbet-scoop.png",
    rating: 4.3,
    shop_name: "Tropical Treats",
    date_logged: "2023-06-20",
  },
]

export default function PersonalFlavorCollection({ userId, isDemoUser = false }) {
  const [flavors, setFlavors] = useState([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState("grid")
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchFlavors() {
      if (isDemoUser) {
        setFlavors(DEMO_FLAVORS)
        setLoading(false)
        return
      }

      try {
        // Use the userId from props if available, otherwise use the authenticated user's ID
        const id = userId || user?.id

        if (!id) {
          console.error("No user ID available to fetch flavors")
          setLoading(false)
          return
        }

        const { data, error } = await supabase
          .from("flavor_logs")
          .select(
            `
            id,
            rating,
            notes,
            date_logged,
            flavors (
              id,
              name,
              image_url
            ),
            shops (
              id,
              name
            )
          `,
          )
          .eq("user_id", id)
          .order("date_logged", { ascending: false })

        if (error) {
          throw error
        }

        // Transform the data to match our expected format
        const formattedData = data.map((item) => ({
          id: item.flavors?.id || "unknown",
          name: item.flavors?.name || "Unknown Flavor",
          image_url: item.flavors?.image_url || "/colorful-ice-cream-cones.png",
          rating: item.rating,
          shop_name: item.shops?.name || "Unknown Shop",
          date_logged: item.date_logged,
          notes: item.notes,
        }))

        setFlavors(formattedData)
      } catch (error) {
        console.error("Error fetching flavors:", error)
        // Fallback to demo data on error
        setFlavors(DEMO_FLAVORS)
      } finally {
        setLoading(false)
      }
    }

    fetchFlavors()
  }, [userId, isDemoUser, supabase, user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Flavor Collection</CardTitle>
          <CardDescription>Loading your flavor collection...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-48 rounded-md bg-gray-200 animate-pulse"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (flavors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>My Flavor Collection</CardTitle>
          <CardDescription>You haven't logged any flavors yet.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center py-10">
          <div className="text-center mb-6">
            <p className="text-muted-foreground mb-4">Start building your collection by logging your first flavor!</p>
            <Button asChild>
              <Link href="/dashboard/log-flavor">Log Your First Flavor</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>My Flavor Collection</CardTitle>
          <CardDescription>You've logged {flavors.length} flavors</CardDescription>
        </div>
        <div className="flex space-x-2">
          <Button
            variant={viewMode === "grid" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("grid")}
            aria-label="Grid view"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("list")}
            aria-label="List view"
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "calendar" ? "default" : "outline"}
            size="icon"
            onClick={() => setViewMode("calendar")}
            aria-label="Calendar view"
          >
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "grid" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {flavors.map((flavor) => (
              <Link
                href={`/dashboard/flavors/${flavor.id}`}
                key={`${flavor.id}-${flavor.date_logged}`}
                className="group"
              >
                <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-square relative bg-gray-100">
                    <Image
                      src={flavor.image_url || "/placeholder.svg"}
                      alt={flavor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium text-lg">{flavor.name}</h3>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-sm text-muted-foreground">{flavor.shop_name}</span>
                      <div className="flex items-center">
                        <span className="text-amber-500">★</span>
                        <span className="ml-1 text-sm">{flavor.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {viewMode === "list" && (
          <div className="divide-y">
            {flavors.map((flavor) => (
              <Link
                href={`/dashboard/flavors/${flavor.id}`}
                key={`${flavor.id}-${flavor.date_logged}`}
                className="group"
              >
                <div className="py-3 flex items-center space-x-4 hover:bg-gray-50 rounded-md px-2 transition-colors">
                  <div className="h-12 w-12 relative rounded-md overflow-hidden bg-gray-100 flex-shrink-0">
                    <Image
                      src={flavor.image_url || "/placeholder.svg"}
                      alt={flavor.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{flavor.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{flavor.shop_name}</p>
                  </div>
                  <div className="flex items-center">
                    <span className="text-amber-500">★</span>
                    <span className="ml-1">{flavor.rating.toFixed(1)}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(flavor.date_logged).toLocaleDateString()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {viewMode === "calendar" && (
          <div className="space-y-4">
            {/* Group flavors by month */}
            {Object.entries(
              flavors.reduce((acc, flavor) => {
                const date = new Date(flavor.date_logged)
                const monthYear = `${date.toLocaleString("default", { month: "long" })} ${date.getFullYear()}`
                if (!acc[monthYear]) {
                  acc[monthYear] = []
                }
                acc[monthYear].push(flavor)
                return acc
              }, {}),
            ).map(([monthYear, monthFlavors]) => (
              <div key={monthYear}>
                <h3 className="font-medium text-lg mb-2">{monthYear}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {(monthFlavors as any[]).map((flavor) => (
                    <Link
                      href={`/dashboard/flavors/${flavor.id}`}
                      key={`${flavor.id}-${flavor.date_logged}`}
                      className="group"
                    >
                      <div className="border rounded-lg overflow-hidden flex hover:shadow-sm transition-shadow">
                        <div className="w-16 h-16 relative bg-gray-100 flex-shrink-0">
                          <Image
                            src={flavor.image_url || "/placeholder.svg"}
                            alt={flavor.name}
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        </div>
                        <div className="p-2 flex-1">
                          <h4 className="font-medium text-sm truncate">{flavor.name}</h4>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
                              {flavor.shop_name}
                            </span>
                            <div className="flex items-center">
                              <span className="text-amber-500 text-xs">★</span>
                              <span className="ml-0.5 text-xs">{flavor.rating.toFixed(1)}</span>
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {new Date(flavor.date_logged).toLocaleDateString(undefined, { day: "numeric" })}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
