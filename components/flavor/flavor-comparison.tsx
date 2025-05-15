"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface FlavorComparisonProps {
  currentFlavorId: string
}

export function FlavorComparison({ currentFlavorId }: FlavorComparisonProps) {
  const [currentFlavor, setCurrentFlavor] = useState<any>(null)
  const [compareFlavor, setCompareFlavor] = useState<any>(null)
  const [flavorOptions, setFlavorOptions] = useState<any[]>([])
  const [selectedFlavorId, setSelectedFlavorId] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  // Fetch the current flavor and flavor options
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)

      try {
        // Get the current flavor
        const { data: current, error: currentError } = await supabase
          .from("flavor_logs")
          .select("id, name, rating, category, tags")
          .eq("id", currentFlavorId)
          .single()

        if (currentError) throw currentError

        setCurrentFlavor(current)

        // Get other flavors for comparison
        const { data: options, error: optionsError } = await supabase
          .from("flavor_logs")
          .select("id, name, shops:shop_id (name)")
          .neq("id", currentFlavorId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (optionsError) throw optionsError

        setFlavorOptions(options || [])
      } catch (error) {
        console.error("Error fetching flavor data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [currentFlavorId, supabase])

  // Fetch the comparison flavor when selected
  useEffect(() => {
    if (!selectedFlavorId) {
      setCompareFlavor(null)
      return
    }

    const fetchCompareFlavor = async () => {
      try {
        const { data, error } = await supabase
          .from("flavor_logs")
          .select("id, name, rating, category, tags")
          .eq("id", selectedFlavorId)
          .single()

        if (error) throw error

        setCompareFlavor(data)
      } catch (error) {
        console.error("Error fetching comparison flavor:", error)
      }
    }

    fetchCompareFlavor()
  }, [selectedFlavorId, supabase])

  // Generate comparison metrics
  const getComparisonMetrics = () => {
    if (!currentFlavor || !compareFlavor) return null

    // Generate random metrics for demo purposes
    // In a real app, these would be calculated based on actual flavor data
    const metrics = {
      sweetness: {
        current: Math.floor(Math.random() * 40) + 60,
        compare: Math.floor(Math.random() * 40) + 60,
      },
      creaminess: {
        current: Math.floor(Math.random() * 40) + 60,
        compare: Math.floor(Math.random() * 40) + 60,
      },
      richness: {
        current: Math.floor(Math.random() * 40) + 60,
        compare: Math.floor(Math.random() * 40) + 60,
      },
      intensity: {
        current: Math.floor(Math.random() * 40) + 60,
        compare: Math.floor(Math.random() * 40) + 60,
      },
    }

    return metrics
  }

  const metrics = getComparisonMetrics()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Flavor Comparison</CardTitle>
        <CardDescription>Compare this flavor with another from your collection</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-6">
            <Skeleton className="h-10 w-full" />
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-4 w-[200px]" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <Select value={selectedFlavorId} onValueChange={setSelectedFlavorId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a flavor to compare" />
                </SelectTrigger>
                <SelectContent>
                  {flavorOptions.map((flavor) => (
                    <SelectItem key={flavor.id} value={flavor.id}>
                      {flavor.name} {flavor.shops?.name ? `(${flavor.shops.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {compareFlavor && metrics ? (
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <h3 className="font-medium">{currentFlavor.name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-sm font-medium">{currentFlavor.rating}/10</span>
                    </div>
                  </div>
                  <div className="text-center p-3 bg-muted/50 rounded-md">
                    <h3 className="font-medium">{compareFlavor.name}</h3>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className="text-sm font-medium">{compareFlavor.rating}/10</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Sweetness</span>
                      <div className="flex gap-4">
                        <span>{metrics.sweetness.current}%</span>
                        <span>{metrics.sweetness.compare}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Progress value={metrics.sweetness.current} className="h-2" />
                      <Progress value={metrics.sweetness.compare} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Creaminess</span>
                      <div className="flex gap-4">
                        <span>{metrics.creaminess.current}%</span>
                        <span>{metrics.creaminess.compare}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Progress value={metrics.creaminess.current} className="h-2" />
                      <Progress value={metrics.creaminess.compare} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Richness</span>
                      <div className="flex gap-4">
                        <span>{metrics.richness.current}%</span>
                        <span>{metrics.richness.compare}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Progress value={metrics.richness.current} className="h-2" />
                      <Progress value={metrics.richness.compare} className="h-2" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Flavor Intensity</span>
                      <div className="flex gap-4">
                        <span>{metrics.intensity.current}%</span>
                        <span>{metrics.intensity.compare}%</span>
                      </div>
                    </div>
                    <div className="flex gap-4">
                      <Progress value={metrics.intensity.current} className="h-2" />
                      <Progress value={metrics.intensity.compare} className="h-2" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Category</h4>
                    <div className="p-2 bg-muted/30 rounded text-sm">{currentFlavor.category || "Not specified"}</div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2">Category</h4>
                    <div className="p-2 bg-muted/30 rounded text-sm">{compareFlavor.category || "Not specified"}</div>
                  </div>
                </div>
              </div>
            ) : selectedFlavorId ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Loading comparison data...</p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Select a flavor to compare</p>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
