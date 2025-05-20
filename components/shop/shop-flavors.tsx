"use client"

import { useState } from "react"
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, Plus } from "lucide-react"
import Link from "next/link"
import { AddFlavorModal } from "./add-flavor-modal"

interface Flavor {
  id: string
  name: string
  description: string | null
  base_type: string | null
  image_url: string | null
  rating: number | null
}

interface ShopFlavorsProps {
  shopId: string
  initialFlavors: Flavor[]
}

export function ShopFlavors({ shopId, initialFlavors }: ShopFlavorsProps) {
  const [flavors, setFlavors] = useState<Flavor[]>(initialFlavors)
  const [isAddFlavorModalOpen, setIsAddFlavorModalOpen] = useState(false)

  const getBaseTypeColor = (baseType: string | null) => {
    switch (baseType?.toLowerCase()) {
      case "dairy":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "sorbet":
        return "bg-pink-100 text-pink-800 border-pink-200"
      case "gelato":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "vegan":
        return "bg-green-100 text-green-800 border-green-200"
      case "frozen-yogurt":
        return "bg-purple-100 text-purple-800 border-purple-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {flavors.length > 0 ? (
          flavors.map((flavor) => (
            <Card key={flavor.id} className="overflow-hidden">
              <div className="aspect-square w-full overflow-hidden bg-muted">
                <img
                  src={flavor.image_url || "/placeholder.svg?height=200&width=200&query=ice cream scoop"}
                  alt={flavor.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{flavor.name}</CardTitle>
                  <Badge variant="outline" className={getBaseTypeColor(flavor.base_type)}>
                    {flavor.base_type || "Unknown"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {flavor.description || "No description available."}
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Star className="mr-1 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium">{flavor.rating?.toFixed(1) || "New"}</span>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/flavors/${flavor.id}`}>View Details</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex h-40 flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center">
            <p className="text-muted-foreground">No flavors available for this shop yet.</p>
            <Button className="mt-4" onClick={() => setIsAddFlavorModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add First Flavor
            </Button>
          </div>
        )}
      </div>

      {/* Add Flavor Modal */}
      <AddFlavorModal
        isOpen={isAddFlavorModalOpen}
        onClose={() => setIsAddFlavorModalOpen(false)}
        shop={{ id: shopId, name: "this shop" }}
      />
    </>
  )
}
