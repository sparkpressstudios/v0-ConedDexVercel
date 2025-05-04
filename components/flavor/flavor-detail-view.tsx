"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Image from "next/image"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

export function FlavorDetailView() {
  const searchParams = useSearchParams()
  const flavorId = searchParams.get("id")
  const [flavor, setFlavor] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function fetchFlavorDetails() {
      if (!flavorId) {
        setFlavor(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from("flavors")
          .select(`
            *,
            flavor_categories(name),
            flavor_ingredients(
              ingredients(name)
            )
          `)
          .eq("id", flavorId)
          .single()

        if (error) throw error
        setFlavor(data)
      } catch (err: any) {
        console.error("Error fetching flavor details:", err)
        setError(err.message || "Failed to load flavor details")
      } finally {
        setLoading(false)
      }
    }

    fetchFlavorDetails()
  }, [flavorId, supabase])

  if (!flavorId) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Select a flavor to view details</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-[200px] w-full rounded-lg" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <p className="text-red-500">{error}</p>
        <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    )
  }

  if (!flavor) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">Flavor not found</p>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{flavor.name}</CardTitle>
        <div className="flex flex-wrap gap-2 mt-2">
          <Badge variant="secondary">{flavor.flavor_categories?.name}</Badge>
          {flavor.dairy_free && <Badge variant="outline">Dairy Free</Badge>}
          {flavor.vegan && <Badge variant="outline">Vegan</Badge>}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {flavor.image_url ? (
          <div className="relative h-[200px] w-full overflow-hidden rounded-md">
            <Image src={flavor.image_url || "/placeholder.svg"} alt={flavor.name} fill className="object-cover" />
          </div>
        ) : (
          <div className="relative h-[200px] w-full overflow-hidden rounded-md bg-muted flex items-center justify-center">
            <span className="text-muted-foreground">No image available</span>
          </div>
        )}

        <div>
          <h3 className="font-medium mb-2">Description</h3>
          <p className="text-sm text-muted-foreground">{flavor.description || "No description available"}</p>
        </div>

        {flavor.flavor_ingredients && flavor.flavor_ingredients.length > 0 && (
          <div>
            <h3 className="font-medium mb-2">Ingredients</h3>
            <ul className="list-disc list-inside text-sm text-muted-foreground">
              {flavor.flavor_ingredients.map((item: any, index: number) => (
                <li key={index}>{item.ingredients.name}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h3 className="font-medium mb-1">Popularity</h3>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(flavor.popularity / 2)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300 fill-current"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-1">Sweetness</h3>
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <svg
                  key={i}
                  className={`h-4 w-4 ${
                    i < Math.round(flavor.sweetness_level) ? "text-pink-400 fill-current" : "text-gray-300 fill-current"
                  }`}
                  viewBox="0 0 20 20"
                >
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Log Tasting
        </Button>
        <Button size="sm">Add to Favorites</Button>
      </CardFooter>
    </Card>
  )
}
