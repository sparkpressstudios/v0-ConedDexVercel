"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { MobileFlavorLogger } from "@/components/flavor/mobile-flavor-logger"
import { cn } from "@/lib/utils"
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  Star,
  Heart,
  Share2,
  IceCream,
  Users,
  MessageSquare,
  ChevronLeft,
  Plus,
} from "lucide-react"

export default function MobileShopDetailsPage() {
  const params = useParams()
  const shopId = params.id as string
  const [shop, setShop] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLogFlavorOpen, setIsLogFlavorOpen] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    async function fetchShopDetails() {
      setLoading(true)

      try {
        // In a real implementation, you would fetch actual shop data
        // This is a placeholder that simulates fetching data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock shop data
        const mockShop = {
          id: shopId,
          name: "Creamy Delights",
          description:
            "A family-owned ice cream shop serving handcrafted flavors made with locally sourced ingredients.",
          address: "123 Main St, Anytown, USA",
          phone: "(555) 123-4567",
          website: "https://creamydelights.example.com",
          business_hours: "Mon-Sat: 11am-10pm, Sun: 12pm-8pm",
          image_url: null,
          backdrop_photo: null,
          is_verified: true,
          rating: 4.7,
          total_reviews: 128,
          total_followers: 256,
          flavors: [
            {
              id: "1",
              name: "Vanilla Bean",
              description: "Classic vanilla bean ice cream",
              image_url: null,
              rating: 4.8,
            },
            {
              id: "2",
              name: "Chocolate Fudge",
              description: "Rich chocolate fudge ice cream",
              image_url: null,
              rating: 4.7,
            },
            {
              id: "3",
              name: "Strawberry Swirl",
              description: "Strawberry ice cream with swirls of strawberry sauce",
              image_url: null,
              rating: 4.5,
            },
            {
              id: "4",
              name: "Mint Chocolate Chip",
              description: "Mint ice cream with chocolate chips",
              image_url: null,
              rating: 4.6,
            },
            {
              id: "5",
              name: "Cookies and Cream",
              description: "Vanilla ice cream with cookie pieces",
              image_url: null,
              rating: 4.9,
            },
          ],
          reviews: [
            {
              id: "1",
              user: {
                username: "alexj",
                avatar_url: null,
              },
              rating: 5,
              comment: "Best ice cream shop in town! The Vanilla Bean is amazing.",
              created_at: "2023-06-15T14:30:00Z",
            },
            {
              id: "2",
              user: {
                username: "samsmith",
                avatar_url: null,
              },
              rating: 4,
              comment: "Great flavors and friendly staff. A bit pricey though.",
              created_at: "2023-06-10T11:15:00Z",
            },
            {
              id: "3",
              user: {
                username: "taylorw",
                avatar_url: null,
              },
              rating: 5,
              comment: "Love the seasonal flavors! Always something new to try.",
              created_at: "2023-06-05T16:45:00Z",
            },
          ],
        }

        setShop(mockShop)
      } catch (error) {
        console.error("Error fetching shop details:", error)
      } finally {
        setLoading(false)
      }
    }

    if (shopId) {
      fetchShopDetails()
    }
  }, [shopId, supabase])

  // Toggle follow status
  const toggleFollow = () => {
    setIsFollowing(!isFollowing)
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/shops">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <Skeleton className="h-6 w-40" />
        </div>

        <Skeleton className="h-40 w-full" />

        <div className="flex items-center gap-4">
          <Skeleton className="h-16 w-16 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex gap-2">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-10" />
        </div>

        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-4">
        <IceCream className="h-12 w-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Shop Not Found</h2>
        <p className="text-muted-foreground text-center mb-6">We couldn't find the shop you're looking for.</p>
        <Button asChild>
          <Link href="/dashboard/shops">Browse Shops</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-16">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b p-4 flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/shops">
            <ChevronLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-lg font-bold">{shop.name}</h1>
        {shop.is_verified && (
          <Badge variant="outline" className="ml-auto">
            Verified
          </Badge>
        )}
      </div>

      {/* Cover Image */}
      <div className="relative h-48 w-full bg-neutral-100">
        {shop.backdrop_photo ? (
          <Image
            src={shop.backdrop_photo || "/placeholder.svg"}
            alt={`${shop.name} backdrop`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
            <IceCream className="h-12 w-12 text-primary-300" />
          </div>
        )}
      </div>

      {/* Shop Info */}
      <div className="p-4">
        <div className="flex items-start gap-4 mb-4">
          <Avatar className="h-16 w-16 rounded-lg border-2 border-white shadow-sm">
            <AvatarImage src={shop.image_url || `https://avatar.vercel.sh/${shop.name}.png`} alt={shop.name} />
            <AvatarFallback className="rounded-lg">{shop.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{shop.name}</h2>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span>{shop.rating}</span>
              <span>({shop.total_reviews} reviews)</span>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{shop.address}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mb-6">
          <Button variant={isFollowing ? "default" : "outline"} className="flex-1" onClick={toggleFollow}>
            <Heart className={cn("h-4 w-4 mr-2", isFollowing && "fill-white")} />
            {isFollowing ? "Following" : "Follow"}
          </Button>
          <Dialog open={isLogFlavorOpen} onOpenChange={setIsLogFlavorOpen}>
            <DialogTrigger asChild>
              <Button className="flex-1">
                <IceCream className="h-4 w-4 mr-2" />
                Log Flavor
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log a Flavor</DialogTitle>
              </DialogHeader>
              <MobileFlavorLogger userId="user123" onSuccess={() => setIsLogFlavorOpen(false)} />
            </DialogContent>
          </Dialog>
          <Button variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Shop Details */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-4">
            {shop.description && (
              <div>
                <h3 className="font-medium mb-1">About</h3>
                <p className="text-sm text-muted-foreground">{shop.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-neutral-500" />
                </div>
                <div>
                  <p className="text-sm font-medium">Address</p>
                  <p className="text-xs text-muted-foreground">{shop.address}</p>
                </div>
              </div>

              {shop.phone && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Phone className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Phone</p>
                    <p className="text-xs text-muted-foreground">{shop.phone}</p>
                  </div>
                </div>
              )}

              {shop.website && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Website</p>
                    <a
                      href={shop.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary-600 hover:underline"
                    >
                      {shop.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                </div>
              )}

              {shop.business_hours && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-neutral-100 flex items-center justify-center">
                    <Clock className="h-4 w-4 text-neutral-500" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Hours</p>
                    <p className="text-xs text-muted-foreground">{shop.business_hours}</p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="flavors">
          <TabsList className="w-full grid grid-cols-3">
            <TabsTrigger value="flavors">
              <IceCream className="h-4 w-4 mr-2" />
              Flavors
            </TabsTrigger>
            <TabsTrigger value="reviews">
              <Star className="h-4 w-4 mr-2" />
              Reviews
            </TabsTrigger>
            <TabsTrigger value="community">
              <Users className="h-4 w-4 mr-2" />
              Community
            </TabsTrigger>
          </TabsList>

          <TabsContent value="flavors" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Popular Flavors</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/shops/${shopId}/flavors`}>View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {shop.flavors.slice(0, 5).map((flavor: any) => (
                <Card key={flavor.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex items-center gap-3 p-3">
                      <div
                        className="h-12 w-12 rounded-md flex items-center justify-center"
                        style={{
                          backgroundColor: flavor.name.toLowerCase().includes("vanilla")
                            ? "#FFF9C4"
                            : flavor.name.toLowerCase().includes("chocolate")
                              ? "#D7CCC8"
                              : flavor.name.toLowerCase().includes("strawberry")
                                ? "#FFCDD2"
                                : flavor.name.toLowerCase().includes("mint")
                                  ? "#C8E6C9"
                                  : flavor.name.toLowerCase().includes("cookie")
                                    ? "#E0E0E0"
                                    : "#BBDEFB",
                        }}
                      >
                        <IceCream
                          className="h-6 w-6"
                          style={{
                            color: flavor.name.toLowerCase().includes("vanilla")
                              ? "#FBC02D"
                              : flavor.name.toLowerCase().includes("chocolate")
                                ? "#795548"
                                : flavor.name.toLowerCase().includes("strawberry")
                                  ? "#E57373"
                                  : flavor.name.toLowerCase().includes("mint")
                                    ? "#66BB6A"
                                    : flavor.name.toLowerCase().includes("cookie")
                                      ? "#757575"
                                      : "#42A5F5",
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{flavor.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-1">{flavor.description}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{flavor.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" asChild className="mt-2">
                <Link href={`/dashboard/shops/${shopId}/add-flavor`}>
                  <Plus className="h-4 w-4 mr-2" />
                  Log a New Flavor
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Customer Reviews</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/shops/${shopId}/reviews`}>View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {shop.reviews.map((review: any) => (
                <Card key={review.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={review.user.avatar_url || `https://avatar.vercel.sh/${review.user.username}.png`}
                          alt={review.user.username}
                        />
                        <AvatarFallback>{review.user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium text-sm">{review.user.username}</p>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="text-sm font-medium">{review.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(review.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm mt-2">{review.comment}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" className="mt-2">
                <MessageSquare className="h-4 w-4 mr-2" />
                Write a Review
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="community" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Community</h3>
              <span className="text-sm text-muted-foreground">{shop.total_followers} followers</span>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                  <h3 className="font-medium mb-1">Join the Community</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Follow this shop to see updates and connect with other ice cream lovers
                  </p>
                  <Button onClick={toggleFollow}>
                    <Heart className={cn("h-4 w-4 mr-2", isFollowing && "fill-white")} />
                    {isFollowing ? "Following" : "Follow Shop"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
