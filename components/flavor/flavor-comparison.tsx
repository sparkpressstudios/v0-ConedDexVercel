"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Star, IceCream, X, ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function FlavorComparison({ isDemoUser = false }) {
  const supabase = createClient()
  const [flavors, setFlavors] = useState<any[]>([])
  const [selectedFlavors, setSelectedFlavors] = useState<any[]>([null, null])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isDemoUser) {
      // Use demo data
      setFlavors([
        {
          id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
          name: "Vanilla Bean Dream",
          description: "Rich vanilla bean ice cream with real Madagascar vanilla beans.",
          base_type: "dairy",
          category: "classic",
          rarity: "common",
          image_url: "https://images.unsplash.com/photo-1570197788417-0e82375c9371",
          rating: 4.5,
          calories: 180,
          sugar: 18,
          fat: 10,
          protein: 3,
          tags: ["vanilla", "creamy", "classic"],
        },
        {
          id: "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
          name: "Chocolate Fudge Brownie",
          description: "Decadent chocolate ice cream with fudge swirls and brownie chunks.",
          base_type: "dairy",
          category: "chocolate",
          rarity: "common",
          image_url: "https://images.unsplash.com/photo-1563805042-7684c019e1cb",
          rating: 4.8,
          calories: 240,
          sugar: 24,
          fat: 14,
          protein: 4,
          tags: ["chocolate", "fudge", "brownie"],
        },
        {
          id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
          name: "Strawberry Fields",
          description: "Fresh strawberry ice cream with real strawberry pieces.",
          base_type: "dairy",
          category: "fruit",
          rarity: "common",
          image_url: "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f",
          rating: 4.6,
          calories: 170,
          sugar: 22,
          fat: 8,
          protein: 3,
          tags: ["strawberry", "fruit", "refreshing"],
        },
        {
          id: "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
          name: "Mint Chocolate Chip",
          description: "Refreshing mint ice cream with chocolate chips throughout.",
          base_type: "dairy",
          category: "classic",
          rarity: "common",
          image_url: "https://images.unsplash.com/photo-1580915411954-282cb1b0d780",
          rating: 4.7,
          calories: 200,
          sugar: 20,
          fat: 12,
          protein: 3,
          tags: ["mint", "chocolate", "refreshing"],
        },
      ])
      setLoading(false)
    } else {
      // Fetch real data
      fetchFlavors()
    }
  }, [isDemoUser])

  const fetchFlavors = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("flavors").select("*")
      if (error) throw error
      setFlavors(data || [])
    } catch (error) {
      console.error("Error fetching flavors:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectFlavor = (index: number, flavorId: string) => {
    const flavor = flavors.find((f) => f.id === flavorId)
    const newSelectedFlavors = [...selectedFlavors]
    newSelectedFlavors[index] = flavor
    setSelectedFlavors(newSelectedFlavors)
  }

  const handleRemoveFlavor = (index: number) => {
    const newSelectedFlavors = [...selectedFlavors]
    newSelectedFlavors[index] = null
    setSelectedFlavors(newSelectedFlavors)
  }

  const handleSwapFlavors = () => {
    setSelectedFlavors([selectedFlavors[1], selectedFlavors[0]])
  }

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Flavor Comparison</h2>
          <p className="text-muted-foreground">Compare ice cream flavors side by side</p>
        </div>
        {selectedFlavors[0] && selectedFlavors[1] && (
          <Button variant="outline" onClick={handleSwapFlavors}>
            <ArrowRight className="mr-2 h-4 w-4" />
            Swap Flavors
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {selectedFlavors.map((flavor, index) => (
          <Card key={index} className="overflow-hidden">
            <CardHeader className="pb-0">
              <div className="flex items-center justify-between">
                <CardTitle>Flavor {index + 1}</CardTitle>
                {flavor && (
                  <Button variant="ghost" size="icon" onClick={() => handleRemoveFlavor(index)}>
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove</span>
                  </Button>
                )}
              </div>
              <CardDescription>{flavor ? "Selected flavor details" : "Select a flavor to compare"}</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {flavor ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-muted relative rounded-md overflow-hidden">
                    {flavor.image_url ? (
                      <img
                        src={flavor.image_url || "/placeholder.svg"}
                        alt={flavor.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint-100 to-blueberry-200">
                        <IceCream className="h-16 w-16 text-mint-500" />
                      </div>
                    )}
                    {flavor.rarity && (
                      <Badge className={`absolute top-2 right-2 ${getRarityColor(flavor.rarity)}`}>
                        {flavor.rarity}
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-semibold">{flavor.name}</h3>
                    <div className="flex items-center mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-medium">{flavor.rating}</span>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <Badge variant="outline">{flavor.base_type}</Badge>
                      <span className="mx-2 text-muted-foreground">•</span>
                      <Badge variant="secondary">{flavor.category}</Badge>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">{flavor.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Calories</p>
                      <p className="text-lg font-semibold">{flavor.calories || "N/A"}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Sugar (g)</p>
                      <p className="text-lg font-semibold">{flavor.sugar || "N/A"}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Fat (g)</p>
                      <p className="text-lg font-semibold">{flavor.fat || "N/A"}</p>
                    </div>
                    <div className="rounded-lg bg-muted p-3">
                      <p className="text-xs text-muted-foreground">Protein (g)</p>
                      <p className="text-lg font-semibold">{flavor.protein || "N/A"}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-2">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {flavor.tags && flavor.tags.length > 0 ? (
                        flavor.tags.map((tag: string, i: number) => (
                          <Badge key={i} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags available</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Select onValueChange={(value) => handleSelectFlavor(index, value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a flavor" />
                    </SelectTrigger>
                    <SelectContent>
                      {flavors.map((flavor) => (
                        <SelectItem key={flavor.id} value={flavor.id}>
                          {flavor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex h-[300px] items-center justify-center rounded-md border border-dashed">
                    <div className="text-center">
                      <IceCream className="mx-auto h-12 w-12 text-muted-foreground/50" />
                      <h3 className="mt-2 text-lg font-medium">No flavor selected</h3>
                      <p className="mt-1 text-sm text-muted-foreground">Select a flavor from the dropdown above</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedFlavors[0] && selectedFlavors[1] && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Summary</CardTitle>
            <CardDescription>Key differences between the selected flavors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-1 font-medium">Feature</div>
                <div className="col-span-1 font-medium">{selectedFlavors[0].name}</div>
                <div className="col-span-1 font-medium">{selectedFlavors[1].name}</div>
              </div>
              <div className="border-t pt-4">
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Base Type</div>
                  <div className="col-span-1">{selectedFlavors[0].base_type || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].base_type || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Category</div>
                  <div className="col-span-1">{selectedFlavors[0].category || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].category || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Rating</div>
                  <div className="col-span-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {selectedFlavors[0].rating || "N/A"}
                    </div>
                  </div>
                  <div className="col-span-1">
                    <div className="flex items-center">
                      <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                      {selectedFlavors[1].rating || "N/A"}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Calories</div>
                  <div className="col-span-1">{selectedFlavors[0].calories || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].calories || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Sugar (g)</div>
                  <div className="col-span-1">{selectedFlavors[0].sugar || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].sugar || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4 mb-2">
                  <div className="col-span-1">Fat (g)</div>
                  <div className="col-span-1">{selectedFlavors[0].fat || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].fat || "N/A"}</div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">Protein (g)</div>
                  <div className="col-span-1">{selectedFlavors[0].protein || "N/A"}</div>
                  <div className="col-span-1">{selectedFlavors[1].protein || "N/A"}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
