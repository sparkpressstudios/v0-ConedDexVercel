"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Globe, Star, IceCream } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { Skeleton } from "@/components/ui/skeleton"

// Demo shop data
const demoShop = {
  id: "shop_1",
  name: "Sweet Scoops",
  description: "A family-owned ice cream parlor serving handcrafted flavors made with locally sourced ingredients.",
  address: "123 Main St, Anytown, CA",
  city: "Anytown",
  state: "CA",
  phone: "(555) 123-4567",
  website: "https://sweetscoops.example.com",
  image_url: "/placeholder.svg?key=h8tp0",
  rating: 4.8,
  hours: {
    monday: "11:00 AM - 9:00 PM",
    tuesday: "11:00 AM - 9:00 PM",
    wednesday: "11:00 AM - 9:00 PM",
    thursday: "11:00 AM - 9:00 PM",
    friday: "11:00 AM - 10:00 PM",
    saturday: "10:00 AM - 10:00 PM",
    sunday: "12:00 PM - 8:00 PM",
  },
}

// Demo flavors data
const demoFlavors = [
  {
    id: "flavor_1",
    name: "Vanilla Bean",
    description: "Classic vanilla made with real Madagascar vanilla beans",
    base_type: "Dairy",
    image_url: "/placeholder.svg?key=52f5p",
    rating: 4.7,
  },
  {
    id: "flavor_2",
    name: "Chocolate Fudge",
    description: "Rich chocolate ice cream with fudge swirls",
    base_type: "Dairy",
    image_url: "/chocolate-ice-cream-scoop.png",
    rating: 4.9,
  },
  {
    id: "flavor_3",
    name: "Strawberry Fields",
    description: "Strawberry ice cream with real strawberry pieces",
    base_type: "Dairy",
    image_url: "/strawberry-ice-cream-scoop.png",
    rating: 4.6,
  },
  {
    id: "flavor_4",
    name: "Mint Chocolate Chip",
    description: "Refreshing mint ice cream with chocolate chips",
    base_type: "Dairy",
    image_url: "/mint-chocolate-chip-scoop.png",
    rating: 4.8,
  },
  {
    id: "flavor_5",
    name: "Mango Sorbet",
    description: "Dairy-free sorbet made with ripe mangoes",
    base_type: "Sorbet",
    image_url: "/mango-sorbet-scoop.png",
    rating: 4.5,
  },
  {
    id: "flavor_6",
    name: "Cookies & Cream",
    description: "Vanilla ice cream with chocolate cookie pieces",
    base_type: "Dairy",
    image_url: "/cookies-and-cream-scoop.png",
    rating: 4.7,
  },
]

export default function ShopDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [shop, setShop] = useState<any | null>(null)
  const [flavors, setFlavors] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isDemoUser, setIsDemoUser] = useState(false)

  useEffect(() => {
    const checkDemoUser = () => {
      const demoUserEmail = document.cookie
        .split("; ")
        .find((row) => row.startsWith("conedex_demo_user="))
        ?.split("=")[1]

      if (demoUserEmail) {
        setIsDemoUser(true)
        setShop(demoShop)
        setFlavors(demoFlavors)
        setLoading(false)
        return true
      }
      return false
    }

    const fetchShopData = async () => {
      if (checkDemoUser()) return

      try {
        // Get shop details
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("id", params.id)
          .single()

        if (shopError) throw shopError

        setShop(shopData)

        // Get flavors for this shop
        const { data: flavorData, error: flavorError } = await supabase
          .from("flavors")
          .select("*")
          .eq("shop_id", params.id)
          .order("name")

        if (flavorError) throw flavorError

        setFlavors(flavorData || [])
      } catch (error) {
        console.error("Error fetching shop data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [params.id, supabase])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </div>
        </div>

        <Skeleton className="h-64 w-full rounded-lg" />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center text-center">
        <IceCream className="mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="text-2xl font-bold">Shop Not Found</h2>
        <p className="mt-2 text-muted-foreground">The shop you're looking for doesn't exist or has been removed.</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard/shops")}>
          Back to Shops
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">{shop.name}</h1>
          <p className="text-muted-foreground">{shop.address}</p>
        </div>
      </div>

      <div className="relative h-64 overflow-hidden rounded-lg md:h-80">
        <img
          src={shop.image_url || "/placeholder.svg?height=320&width=1200&query=ice cream shop"}
          alt={shop.name}
          className="h-full w-full object-cover"
        />
        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-background/80 px-3 py-1 text-sm font-medium backdrop-blur-sm">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <span>{shop.rating || "New"}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>About</CardTitle>
            <CardDescription>Information about this shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {shop.description && <p>{shop.description}</p>}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>
                  {shop.address}, {shop.city}, {shop.state}
                </span>
              </div>
              {shop.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{shop.phone}</span>
                </div>
              )}
              {shop.website && (
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {shop.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Hours</CardTitle>
            <CardDescription>When you can visit</CardDescription>
          </CardHeader>
          <CardContent>
            {shop.hours ? (
              <div className="space-y-1">
                {Object.entries(shop.hours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="capitalize">{day}</span>
                    <span>{hours}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">Hours not available</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="flavors" className="w-full">
        <TabsList>
          <TabsTrigger value="flavors">Available Flavors</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        <TabsContent value="flavors" className="space-y-4 pt-4">
          {flavors.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {flavors.map((flavor) => (
                <Card key={flavor.id} className="overflow-hidden">
                  <div className="aspect-square w-full overflow-hidden">
                    <img
                      src={flavor.image_url || "/placeholder.svg?height=200&width=200&query=ice cream scoop"}
                      alt={flavor.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{flavor.name}</CardTitle>
                      <Badge variant="outline">{flavor.base_type}</Badge>
                    </div>
                    <CardDescription>{flavor.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Star className="mr-1 h-4 w-4 fill-amber-400 text-amber-400" />
                        <span className="font-medium">{flavor.rating || "New"}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/dashboard/flavors/${flavor.id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
              <IceCream className="mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-muted-foreground">No flavors available for this shop yet</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="reviews" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Reviews</CardTitle>
              <CardDescription>What people are saying about this shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Star className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Reviews coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-center">
        <Button onClick={() => router.push("/dashboard/log-flavor")}>
          <IceCream className="mr-2 h-4 w-4" />
          Log a Flavor from this Shop
        </Button>
      </div>
    </div>
  )
}
