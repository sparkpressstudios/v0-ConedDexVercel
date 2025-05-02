"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar } from "@/components/ui/avatar"
import { StarIcon, ThumbsUpIcon, TrendingUpIcon, HeartIcon } from "lucide-react"

// Sample data - in a real app, this would come from an API
const popularFlavors = [
  {
    id: 1,
    name: "Chocolate Fudge Brownie",
    rating: 4.8,
    tags: ["chocolate", "fudge", "brownie"],
    image: "/chocolate-ice-cream-scoop.png",
  },
  {
    id: 2,
    name: "Strawberry Cheesecake",
    rating: 4.7,
    tags: ["strawberry", "cheesecake"],
    image: "/strawberry-ice-cream-scoop.png",
  },
  {
    id: 3,
    name: "Mint Chocolate Chip",
    rating: 4.6,
    tags: ["mint", "chocolate"],
    image: "/mint-chocolate-chip-scoop.png",
  },
  {
    id: 4,
    name: "Cookies and Cream",
    rating: 4.5,
    tags: ["cookies", "vanilla"],
    image: "/cookies-and-cream-scoop.png",
  },
]

const trendingFlavors = [
  { id: 5, name: "Matcha Green Tea", rating: 4.3, tags: ["matcha", "tea"], image: "/mint-chocolate-chip-scoop.png" },
  { id: 6, name: "Salted Caramel", rating: 4.7, tags: ["caramel", "salt"], image: "/cookies-and-cream-scoop.png" },
  { id: 7, name: "Lavender Honey", rating: 4.2, tags: ["lavender", "honey"], image: "/strawberry-ice-cream-scoop.png" },
  { id: 8, name: "Balsamic Fig", rating: 4.0, tags: ["balsamic", "fig"], image: "/chocolate-ice-cream-scoop.png" },
]

const seasonalFlavors = [
  {
    id: 9,
    name: "Pumpkin Spice",
    rating: 4.4,
    tags: ["pumpkin", "spice", "seasonal"],
    image: "/cookies-and-cream-scoop.png",
  },
  { id: 10, name: "Eggnog", rating: 4.1, tags: ["eggnog", "seasonal"], image: "/mint-chocolate-chip-scoop.png" },
  {
    id: 11,
    name: "Cranberry Orange",
    rating: 4.3,
    tags: ["cranberry", "orange", "seasonal"],
    image: "/strawberry-ice-cream-scoop.png",
  },
  {
    id: 12,
    name: "Gingerbread",
    rating: 4.2,
    tags: ["gingerbread", "seasonal"],
    image: "/chocolate-ice-cream-scoop.png",
  },
]

interface FlavorCardProps {
  flavor: {
    id: number
    name: string
    rating: number
    tags: string[]
    image: string
  }
}

function FlavorCard({ flavor }: FlavorCardProps) {
  const [saved, setSaved] = useState(false)

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-medium">{flavor.name}</CardTitle>
          <Badge variant="outline" className="flex items-center gap-1">
            <StarIcon className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            {flavor.rating}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 rounded-md">
            <img src={flavor.image || "/placeholder.svg"} alt={flavor.name} className="object-cover" />
          </Avatar>
          <div className="flex flex-wrap gap-1">
            {flavor.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={() => setSaved(!saved)}>
            {saved ? (
              <>
                <HeartIcon className="h-4 w-4 mr-1 fill-rose-500 text-rose-500" />
                Saved
              </>
            ) : (
              <>
                <HeartIcon className="h-4 w-4 mr-1" />
                Save
              </>
            )}
          </Button>
          <Button size="sm">
            <ThumbsUpIcon className="h-4 w-4 mr-1" />
            Try it
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}

export default function FlavorRecommendations() {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Flavor Recommendations</CardTitle>
        <CardDescription>Discover new flavors based on trends and popularity</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="popular">
          <TabsList className="mb-4">
            <TabsTrigger value="popular">
              <ThumbsUpIcon className="h-4 w-4 mr-2" />
              Popular
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUpIcon className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
            <TabsTrigger value="seasonal">
              <StarIcon className="h-4 w-4 mr-2" />
              Seasonal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="popular">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {popularFlavors.map((flavor) => (
                <FlavorCard key={flavor.id} flavor={flavor} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trending">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {trendingFlavors.map((flavor) => (
                <FlavorCard key={flavor.id} flavor={flavor} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="seasonal">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {seasonalFlavors.map((flavor) => (
                <FlavorCard key={flavor.id} flavor={flavor} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          View All Recommendations
        </Button>
      </CardFooter>
    </Card>
  )
}
