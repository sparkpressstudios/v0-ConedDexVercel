"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Heart, IceCream, MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface FlavorCardMobileProps {
  flavor: any
  onFavoriteToggle?: (id: string) => void
  isDemoUser?: boolean
}

export default function FlavorCardMobile({ flavor, onFavoriteToggle, isDemoUser = false }: FlavorCardMobileProps) {
  const [isFavorite, setIsFavorite] = useState(flavor.is_favorite || false)

  const handleFavoriteToggle = () => {
    setIsFavorite(!isFavorite)
    if (onFavoriteToggle) {
      onFavoriteToggle(flavor.id)
    }
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
    <Card className="overflow-hidden">
      <div className="flex">
        <div className="relative h-24 w-24 flex-shrink-0 bg-muted">
          {flavor.image_url ? (
            <img
              src={flavor.image_url || "/placeholder.svg"}
              alt={flavor.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint-100 to-blueberry-200">
              <IceCream className="h-10 w-10 text-mint-500" />
            </div>
          )}
          {flavor.rarity && (
            <Badge className={`absolute bottom-1 left-1 text-xs ${getRarityColor(flavor.rarity)}`}>
              {flavor.rarity}
            </Badge>
          )}
        </div>
        <CardContent className="flex-1 p-3">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-medium line-clamp-1">{flavor.name}</h3>
              <div className="flex items-center mt-0.5 text-xs">
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-0.5" />
                <span>{flavor.rating || "N/A"}</span>
                {flavor.base_type && (
                  <>
                    <span className="mx-1 text-muted-foreground">•</span>
                    <span className="text-muted-foreground">{flavor.base_type}</span>
                  </>
                )}
              </div>
              {flavor.shop_name && (
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-0.5" />
                  <span className="line-clamp-1">{flavor.shop_name}</span>
                </div>
              )}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleFavoriteToggle}>
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-rose-500 text-rose-500" : "text-muted-foreground")} />
              <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
            </Button>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex flex-wrap gap-1">
              {flavor.category && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0 h-5">
                  {flavor.category}
                </Badge>
              )}
              {flavor.tags && flavor.tags.length > 0 && (
                <Badge variant="outline" className="text-xs px-1.5 py-0 h-5">
                  {flavor.tags[0]}
                  {flavor.tags.length > 1 && `+${flavor.tags.length - 1}`}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" className="h-7 px-2" asChild>
              <Link href={`/dashboard/flavors/${flavor.id}`}>
                <ExternalLink className="h-3 w-3 mr-1" />
                <span className="text-xs">Details</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
