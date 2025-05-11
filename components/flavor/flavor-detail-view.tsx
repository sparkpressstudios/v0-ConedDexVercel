"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Heart, MapPin, Calendar, ArrowLeft, Share2, MessageSquare, ThumbsUp, IceCream } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface FlavorDetailViewProps {
  flavor: any
  userLogs: any[]
  allLogs: any[]
  shops: any[]
  averageRating: number
  isDemoUser?: boolean
}

export default function FlavorDetailView({
  flavor,
  userLogs,
  allLogs,
  shops,
  averageRating,
  isDemoUser = false,
}: FlavorDetailViewProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isFavorite, setIsFavorite] = useState(flavor.is_favorite || false)
  const [activeTab, setActiveTab] = useState("overview")

  const toggleFavorite = async () => {
    if (isDemoUser) {
      // For demo users, just update the UI state
      setIsFavorite(!isFavorite)
    } else {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()
        if (!user) return

        const { data: existingFavorite } = await supabase
          .from("user_favorites")
          .select("*")
          .eq("user_id", user.id)
          .eq("flavor_id", flavor.id)
          .single()

        if (existingFavorite) {
          // Remove from favorites
          await supabase.from("user_favorites").delete().eq("id", existingFavorite.id)
        } else {
          // Add to favorites
          await supabase.from("user_favorites").insert({ user_id: user.id, flavor_id: flavor.id })
        }

        setIsFavorite(!isFavorite)
      } catch (error) {
        console.error("Error toggling favorite:", error)
      }
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{flavor.name}</h1>
          <p className="text-muted-foreground">{flavor.base_type}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={toggleFavorite}>
            <Heart className={cn("h-4 w-4", isFavorite ? "fill-rose-500 text-rose-500" : "")} />
            <span className="sr-only">{isFavorite ? "Remove from favorites" : "Add to favorites"}</span>
          </Button>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <div className="aspect-video bg-muted relative">
            {flavor.image_url ? (
              <img
                src={flavor.image_url || "/placeholder.svg"}
                alt={flavor.name}
                className="w-full h-full object-cover"
              />
            ) : allLogs[0]?.photo_url ? (
              <img
                src={allLogs[0].photo_url || "/placeholder.svg"}
                alt={flavor.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-mint-100 to-blueberry-200">
                <IceCream className="h-24 w-24 text-mint-500" />
              </div>
            )}
            {flavor.rarity && (
              <Badge className={`absolute top-4 right-4 ${getRarityColor(flavor.rarity)}`}>{flavor.rarity}</Badge>
            )}
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <div className="px-6 pt-6">
              <TabsList className="w-full">
                <TabsTrigger value="overview" className="flex-1">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex-1">
                  Reviews ({allLogs.length})
                </TabsTrigger>
                <TabsTrigger value="nutrition" className="flex-1">
                  Nutrition
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="overview" className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium">Description</h3>
                  <p className="mt-2">{flavor.description || "No description available"}</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Details</h3>
                  <div className="mt-2 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Type</p>
                      <p className="font-medium">{flavor.base_type || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium">{flavor.category || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Rarity</p>
                      <p className="font-medium">{flavor.rarity || "Unknown"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Average Rating</p>
                      <div className="flex items-center">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="font-medium">{averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground ml-1">
                          ({allLogs.length} {allLogs.length === 1 ? "rating" : "ratings"})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium">Tags</h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {flavor.tags && flavor.tags.length > 0 ? (
                      flavor.tags.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground">No tags available</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="reviews" className="p-6">
              <div className="space-y-6">
                {allLogs.length > 0 ? (
                  allLogs.map((log) => (
                    <div key={log.id} className="border-b pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={log.user_avatar || "/placeholder.svg"} alt="User" />
                          <AvatarFallback>{log.user_name?.substring(0, 2) || "U"}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{log.user_name || "Anonymous User"}</p>
                              <div className="flex items-center text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                <span>{formatDate(log.visit_date || log.created_at)}</span>
                                <span className="mx-1">•</span>
                                <MapPin className="h-3 w-3 mr-1" />
                                <span>{log.shops?.name || "Unknown Shop"}</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{log.rating}</span>
                            </div>
                          </div>
                          {log.notes && <p className="mt-2">{log.notes}</p>}
                          {log.photo_url && (
                            <img
                              src={log.photo_url || "/placeholder.svg"}
                              alt="User photo"
                              className="mt-3 rounded-md max-h-48 object-cover"
                            />
                          )}
                          <div className="mt-3 flex items-center gap-4">
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              <span>Helpful</span>
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 px-2">
                              <MessageSquare className="h-4 w-4 mr-1" />
                              <span>Comment</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <h3 className="text-lg font-medium">No reviews yet</h3>
                    <p className="text-muted-foreground mt-1">Be the first to review this flavor!</p>
                    <Button className="mt-4" onClick={() => router.push("/dashboard/log-flavor")}>
                      Log This Flavor
                    </Button>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="nutrition" className="p-6">
              <div className="space-y-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Nutrition information is not available for this flavor.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Where to Find</CardTitle>
              <CardDescription>Shops that serve this flavor</CardDescription>
            </CardHeader>
            <CardContent>
              {shops.length > 0 ? (
                <ul className="space-y-4">
                  {shops.map((shop) => (
                    <li key={shop.id} className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-strawberry-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium">{shop.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {[shop.address, shop.city, shop.state].filter(Boolean).join(", ")}
                        </p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-sm"
                          onClick={() => router.push(`/dashboard/shops/${shop.id}`)}
                        >
                          View Shop
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No shop information available</p>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => router.push("/dashboard/shops")}>
                Find More Shops
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Logs</CardTitle>
              <CardDescription>Your experiences with this flavor</CardDescription>
            </CardHeader>
            <CardContent>
              {userLogs.length > 0 ? (
                <ul className="space-y-4">
                  {userLogs.map((log) => (
                    <li key={log.id} className="border-b pb-3 last:border-0 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                          <span>{log.rating}</span>
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(log.visit_date || log.created_at)}
                        </div>
                      </div>
                      {log.notes && <p className="text-sm mt-1">{log.notes}</p>}
                      {log.photo_url && (
                        <img
                          src={log.photo_url || "/placeholder.svg"}
                          alt="Your photo"
                          className="mt-2 rounded-md h-24 object-cover"
                        />
                      )}
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-center py-4">
                  <p className="text-muted-foreground">You haven't logged this flavor yet</p>
                  <Button asChild className="mt-2">
                    <a href="/dashboard/log-flavor">Log This Flavor</a>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Similar Flavors</CardTitle>
              <CardDescription>You might also like these</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* This would be populated with actual similar flavors in a real implementation */}
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                    <img
                      src="/chocolate-ice-cream-scoop.png"
                      alt="Chocolate Fudge"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Chocolate Fudge</p>
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>4.8</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                    <img
                      src="/strawberry-ice-cream-scoop.png"
                      alt="Strawberry Cheesecake"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Strawberry Cheesecake</p>
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>4.7</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-md bg-muted overflow-hidden">
                    <img
                      src="/mint-chocolate-chip-scoop.png"
                      alt="Mint Chocolate Chip"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Mint Chocolate Chip</p>
                    <div className="flex items-center text-sm">
                      <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                      <span>4.6</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
