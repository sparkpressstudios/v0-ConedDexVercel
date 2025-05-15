"use client"

import { Star, Store, MapPin, Users, IceCream } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"

interface Shop {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  zip: string
  rating: number
  is_verified: boolean
  shop_type: string
  mainImage?: string
  thumbnailImage?: string
  check_in_count: number
  flavor_count: number
  created_at: string
}

interface PublicShopsListProps {
  shops: Shop[]
  isLoading: boolean
}

export default function PublicShopsList({ shops, isLoading }: PublicShopsListProps) {
  // Find max check-ins for progress bar
  const maxCheckIns = Math.max(...shops.map((shop) => shop.check_in_count), 1)

  if (isLoading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array(6)
          .fill(0)
          .map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="aspect-video w-full" />
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-16 w-full" />
              </CardContent>
              <div className="px-6 pb-4">
                <Skeleton className="h-10 w-full" />
              </div>
            </Card>
          ))}
      </div>
    )
  }

  if (shops.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center text-center">
        <Store className="h-12 w-12 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-medium">No shops found</h3>
        <p className="mt-2 text-sm text-muted-foreground">Try a different search term or adjust your filters</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {shops.map((shop) => (
        <Card key={shop.id} className="overflow-hidden">
          <div className="aspect-video w-full overflow-hidden bg-muted">
            {shop.mainImage ? (
              <img
                src={shop.mainImage || "/placeholder.svg"}
                alt={shop.name}
                className="h-full w-full object-cover transition-all hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-50">
                <Store className="h-10 w-10 text-purple-400" />
              </div>
            )}
          </div>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="line-clamp-1">{shop.name}</CardTitle>
                <CardDescription className="line-clamp-1">
                  {shop.city}, {shop.state}
                </CardDescription>
              </div>
              {shop.is_verified && (
                <Badge variant="default" className="ml-2 bg-purple-600">
                  Verified
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pb-2">
            <div className="flex items-center space-x-1">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="text-sm font-medium">{shop.rating ? shop.rating.toFixed(1) : "New"}</span>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>Check-ins:</span>
                </div>
                <span className="font-medium">{shop.check_in_count}</span>
              </div>
              <Progress
                value={(shop.check_in_count / maxCheckIns) * 100}
                className="h-2"
                indicatorClassName="bg-purple-600"
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                <IceCream className="h-4 w-4 text-muted-foreground" />
                <span>Flavors:</span>
              </div>
              <span className="font-medium">{shop.flavor_count}</span>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="line-clamp-1">{shop.address || `${shop.city}, ${shop.state}`}</span>
            </div>
          </CardContent>
          <CardFooter className="grid grid-cols-2 gap-2 pt-2">
            <Button asChild variant="outline" size="sm">
              <Link href={`/business/${shop.id}`}>Details</Link>
            </Button>
            <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Link href={`/dashboard/shops/${shop.id}`}>Check In</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
