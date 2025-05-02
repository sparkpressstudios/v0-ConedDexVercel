import { cookies } from "next/headers"
import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { IceCream, Star, MapPin, Calendar, ArrowLeft } from "lucide-react"
import Link from "next/link"

// Demo data for flavors
const demoFlavors = {
  "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d": {
    id: "a1b2c3d4-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    name: "Vanilla Bean Dream",
    description: "Rich vanilla bean ice cream with real Madagascar vanilla beans.",
    base_type: "dairy",
    category: "classic",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "Incredibly smooth and creamy with authentic vanilla flavor. Will definitely have again!",
        photo_url:
          "https://images.unsplash.com/photo-1570197788417-0e82375c9371?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
          name: "Sweet Scoops Ice Cream",
          address: "123 Frost Avenue",
          city: "Creamville",
          state: "CA",
        },
      },
    ],
  },
  "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e": {
    id: "b2c3d4e5-6f7a-8b9c-0d1e-2f3a4b5c6d7e",
    name: "Chocolate Fudge Brownie",
    description: "Decadent chocolate ice cream with fudge swirls and brownie chunks.",
    base_type: "dairy",
    category: "chocolate",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "The brownie chunks were so fudgy! Perfect chocolate intensity. My new favorite!",
        photo_url:
          "https://images.unsplash.com/photo-1563805042-7684c019e1cb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
          name: "Sweet Scoops Ice Cream",
          address: "123 Frost Avenue",
          city: "Creamville",
          state: "CA",
        },
      },
    ],
  },
  "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f": {
    id: "c3d4e5f6-7a8b-9c0d-1e2f-3a4b5c6d7e8f",
    name: "Strawberry Fields",
    description: "Fresh strawberry ice cream with real strawberry pieces.",
    base_type: "dairy",
    category: "fruit",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
        user_id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
        rating: 4,
        notes: "Great strawberry flavor, very refreshing!",
        photo_url:
          "https://images.unsplash.com/photo-1497034825429-c343d7c6a68f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "7d8e9f0a-1b2c-3d4e-5f6a-7b8c9d0e1f2a",
          name: "Sweet Scoops Ice Cream",
          address: "123 Frost Avenue",
          city: "Creamville",
          state: "CA",
        },
      },
    ],
  },
  "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a": {
    id: "d4e5f6a7-8b9c-0d1e-2f3a-4b5c6d7e8f9a",
    name: "Mint Chocolate Chip",
    description: "Refreshing mint ice cream with chocolate chips throughout.",
    base_type: "dairy",
    category: "classic",
    rarity: "common",
    image_url:
      "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "The perfect balance of mint and chocolate. So refreshing!",
        photo_url:
          "https://images.unsplash.com/photo-1580915411954-282cb1b0d780?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b",
          name: "Frosty's Delights",
          address: "456 Scoop Street",
          city: "Dessertville",
          state: "NY",
        },
      },
    ],
  },
  "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b": {
    id: "e5f6a7b8-9c0d-1e2f-3a4b-5c6d7e8f9a0b",
    name: "Salted Caramel Swirl",
    description: "Creamy vanilla ice cream with ribbons of salted caramel.",
    base_type: "dairy",
    category: "gourmet",
    rarity: "uncommon",
    image_url:
      "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
        user_id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
        rating: 4,
        notes: "The salt balances the sweetness perfectly. Delicious!",
        photo_url:
          "https://images.unsplash.com/photo-1579954115545-a95591f28bfc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "8e9f0a1b-2c3d-4e5f-6a7b-8c9d0e1f2a3b",
          name: "Frosty's Delights",
          address: "456 Scoop Street",
          city: "Dessertville",
          state: "NY",
        },
      },
    ],
  },
  "f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c": {
    id: "f6a7b8c9-0d1e-2f3a-4b5c-6d7e8f9a0b1c",
    name: "Blueberry Cheesecake",
    description: "Cheesecake ice cream with blueberry swirls and graham cracker pieces.",
    base_type: "dairy",
    category: "dessert",
    rarity: "rare",
    image_url:
      "https://images.unsplash.com/photo-1587563974553-d6c0fbbbcce5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "c9d0e1f2-3a4b-5c6d-7e8f-9a0b1c2d3e4f",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "Tastes just like real cheesecake! The blueberry swirls are amazing.",
        photo_url:
          "https://images.unsplash.com/photo-1587563974553-d6c0fbbbcce5?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
          name: "Gelato Gems",
          address: "789 Cone Court",
          city: "Sweetville",
          state: "CA",
        },
      },
    ],
  },
  "a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d": {
    id: "a7b8c9d0-1e2f-3a4b-5c6d-7e8f9a0b1c2d",
    name: "Mango Sorbet",
    description: "Refreshing dairy-free sorbet made with ripe mangoes.",
    base_type: "sorbet",
    category: "fruit",
    rarity: "uncommon",
    image_url:
      "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "d0e1f2a3-4b5c-6d7e-8f9a-0b1c2d3e4f5a",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "So refreshing and tropical! Perfect for summer days.",
        photo_url:
          "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
          name: "Gelato Gems",
          address: "789 Cone Court",
          city: "Sweetville",
          state: "CA",
        },
      },
      {
        id: "e1f2a3b4-5c6d-7e8f-9a0b-1c2d3e4f5a6b",
        user_id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
        rating: 4,
        notes: "Great dairy-free option with authentic mango flavor.",
        photo_url:
          "https://images.unsplash.com/photo-1560008581-09826d1de69e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "9f0a1b2c-3d4e-5f6a-7b8c-9d0e1f2a3b4c",
          name: "Gelato Gems",
          address: "789 Cone Court",
          city: "Sweetville",
          state: "CA",
        },
      },
    ],
  },
  "b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e": {
    id: "b8c9d0e1-2f3a-4b5c-6d7e-8f9a0b1c2d3e",
    name: "Lavender Honey",
    description: "Delicate lavender-infused ice cream sweetened with local honey.",
    base_type: "dairy",
    category: "floral",
    rarity: "legendary",
    image_url:
      "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80",
    flavor_logs: [
      {
        id: "f2a3b4c5-6d7e-8f9a-0b1c-2d3e4f5a6b7c",
        user_id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
        rating: 5,
        notes: "Such a unique and sophisticated flavor! The honey adds just the right sweetness.",
        photo_url:
          "https://images.unsplash.com/photo-1576506295286-5cda18df43e7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80",
        visit_date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        shops: {
          id: "0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d",
          name: "Artisanal Scoops",
          address: "101 Gelato Lane",
          city: "Craftville",
          state: "OR",
        },
      },
    ],
  },
}

// Demo user types
const demoUsers = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
  },
}

export default async function FlavorDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
  const isDemoUser = demoUserEmail && demoUsers[demoUserEmail]

  let flavor: any = null
  let userLogs: any[] = []
  let allLogs: any[] = []
  let shops: any[] = []
  let averageRating = 0

  if (isDemoUser) {
    // Use demo data
    const demoFlavor = demoFlavors[params.id]

    if (!demoFlavor) {
      notFound()
    }

    flavor = demoFlavor
    allLogs = demoFlavor.flavor_logs

    // Get user's logs for this flavor
    const demoUser = demoUsers[demoUserEmail!]
    userLogs = allLogs.filter((log) => log.user_id === demoUser.id)

    // Calculate average rating
    const ratings = allLogs.map((log) => log.rating).filter(Boolean)
    averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

    // Get unique shops where this flavor was found
    shops = [...new Map(allLogs.map((log) => [log.shops?.id, log.shops])).values()].filter(Boolean)
  } else {
    // Use real data from Supabase
    const supabase = createServerClient()

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      }
    }

    // Get flavor details
    const { data: flavorData } = await supabase
      .from("flavors")
      .select(`
        *,
        flavor_logs (
          id,
          user_id,
          rating,
          notes,
          photo_url,
          visit_date,
          created_at,
          shops:shop_id (
            id,
            name,
            address,
            city,
            state
          )
        )
      `)
      .eq("id", params.id)
      .single()

    if (!flavorData) {
      notFound()
    }

    flavor = flavorData
    allLogs = flavor.flavor_logs

    // Get user's logs for this flavor
    userLogs = allLogs.filter((log) => log.user_id === session.user.id)

    // Calculate average rating
    const ratings = allLogs.map((log) => log.rating).filter(Boolean)
    averageRating = ratings.length > 0 ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : 0

    // Get unique shops where this flavor was found
    shops = [...new Map(allLogs.map((log) => [log.shops?.id, log.shops])).values()].filter(Boolean)
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
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/flavors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{flavor.name}</h1>
        {flavor.rarity && <Badge className={`${getRarityColor(flavor.rarity)}`}>{flavor.rarity}</Badge>}
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
          </div>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>About this flavor</span>
              {flavor.base_type && <Badge variant="outline">{flavor.base_type}</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{flavor.description || "No description available"}</p>

            <div className="flex flex-wrap gap-2">
              {flavor.category && <Badge variant="secondary">{flavor.category}</Badge>}
            </div>

            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{averageRating.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({allLogs.length} {allLogs.length === 1 ? "rating" : "ratings"})
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Where to Find</CardTitle>
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
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No shop information available</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Your Logs</CardTitle>
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
                          {new Date(log.visit_date).toLocaleDateString()}
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
                    <Link href="/dashboard/log-flavor">Log This Flavor</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
