"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Star, IceCream } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface FlavorRecommendationsProps {
  currentFlavorId: string
}

export function FlavorRecommendations({ currentFlavorId }: FlavorRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchRecommendations = async () => {
      setLoading(true)

      try {
        // Get the current flavor's category
        const { data: currentFlavor, error: flavorError } = await supabase
          .from("flavor_logs")
          .select("category, rating")
          .eq("id", currentFlavorId)
          .single()

        if (flavorError) throw flavorError

        // Get recommendations based on the category and rating
        const { data, error } = await supabase
          .from("flavor_logs")
          .select(`
            id,
            name,
            rating,
            image_url,
            shops:shop_id (name)
          `)
          .neq("id", currentFlavorId)
          .eq("category", currentFlavor.category)
          .gte("rating", currentFlavor.rating - 1) // Similar or better rating
          .order("rating", { ascending: false })
          .limit(4)

        if (error) throw error

        setRecommendations(data || [])
      } catch (error) {
        console.error("Error fetching recommendations:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecommendations()
  }, [currentFlavorId, supabase])

  return (
    <Card>
      <CardHeader>
        <CardTitle>You Might Also Like</CardTitle>
        <CardDescription>Based on your flavor preferences</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="h-12 w-12 rounded-md" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[150px]" />
                  <Skeleton className="h-3 w-[100px]" />
                </div>
              </div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="space-y-4">
            {recommendations.map((flavor) => (
              <Link href={`/dashboard/flavors/${flavor.id}`} key={flavor.id} className="flex items-start gap-3 group">
                <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                  {flavor.image_url ? (
                    <Image
                      src={flavor.image_url || "/placeholder.svg"}
                      alt={flavor.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-muted flex items-center justify-center">
                      <IceCream className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate group-hover:text-primary transition-colors">{flavor.name}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground truncate">{flavor.shops?.name || "Unknown Shop"}</p>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-xs">{flavor.rating}/10</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <IceCream className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">No recommendations available</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
