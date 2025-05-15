import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Star, MapPin, Globe, Phone, Clock, Store, CheckCircle } from "lucide-react"
import Link from "next/link"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: shop } = await supabase.from("shops").select("name").eq("id", params.id).single()

  return {
    title: shop ? `${shop.name} | ConeDex` : "Shop Details | ConeDex",
    description: "View shop details, flavors, and check-in information",
  }
}

export default async function ShopDetailPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch shop details
    const { data: shop, error } = await supabase
      .from("shops")
      .select(`
        *,
        shop_checkins(count),
        shop_flavors(
          id,
          name,
          description,
          image_url
        )
      `)
      .eq("id", params.id)
      .single()

    if (error || !shop) {
      console.error("Error fetching shop:", error)
      notFound()
    }

    // Fetch recent check-ins
    const { data: recentCheckins } = await supabase
      .from("shop_checkins")
      .select(`
        id,
        created_at,
        profiles(
          id,
          username,
          avatar_url
        )
      `)
      .eq("shop_id", params.id)
      .order("created_at", { ascending: false })
      .limit(5)

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <div className="rounded-lg overflow-hidden">
              <Image
                src={shop.mainImage || "/placeholder.svg?height=400&width=800&query=ice cream shop"}
                alt={shop.name}
                width={800}
                height={400}
                className="w-full h-[300px] object-cover"
              />
            </div>

            <div className="mt-6">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-purple-900">{shop.name}</h1>
                  <p className="text-lg text-muted-foreground">
                    {shop.city}
                    {shop.state ? `, ${shop.state}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {shop.is_verified && (
                    <Badge className="bg-purple-600">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Verified
                    </Badge>
                  )}
                  {shop.rating && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{shop.rating.toFixed(1)}</span>
                    </Badge>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <p className="text-muted-foreground">{shop.description || "No description available."}</p>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {shop.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">
                        {shop.address}
                        <br />
                        {shop.city}, {shop.state} {shop.zip}
                      </p>
                    </div>
                  </div>
                )}

                {shop.website && (
                  <div className="flex items-start gap-2">
                    <Globe className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Website</p>
                      <a
                        href={shop.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-purple-600 hover:underline"
                      >
                        {shop.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}

                {shop.phone && (
                  <div className="flex items-start gap-2">
                    <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{shop.phone}</p>
                    </div>
                  </div>
                )}

                {shop.openingHours && (
                  <div className="flex items-start gap-2">
                    <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
                    <div>
                      <p className="font-medium">Hours</p>
                      <p className="text-sm text-muted-foreground whitespace-pre-line">{shop.openingHours}</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <Tabs defaultValue="flavors">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="flavors">Flavors</TabsTrigger>
                    <TabsTrigger value="about">About</TabsTrigger>
                  </TabsList>
                  <TabsContent value="flavors" className="mt-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {shop.shop_flavors && shop.shop_flavors.length > 0 ? (
                        shop.shop_flavors.map((flavor) => (
                          <Card key={flavor.id}>
                            <CardHeader className="pb-2">
                              <CardTitle className="text-base">{flavor.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {flavor.description || "No description available."}
                              </p>
                            </CardContent>
                          </Card>
                        ))
                      ) : (
                        <div className="col-span-full py-8 text-center">
                          <p className="text-muted-foreground">No flavors available for this shop yet.</p>
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  <TabsContent value="about" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>About {shop.name}</CardTitle>
                        <CardDescription>Additional information about this shop</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h3 className="font-medium">Description</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {shop.description || "No description available."}
                          </p>
                        </div>
                        {shop.additionalInfo && (
                          <div>
                            <h3 className="font-medium">Additional Information</h3>
                            <p className="text-sm text-muted-foreground mt-1">{shop.additionalInfo}</p>
                          </div>
                        )}
                        <div>
                          <h3 className="font-medium">Added to ConeDex</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(shop.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Check In</CardTitle>
                <CardDescription>Record your visit to this shop</CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full gap-2">
                  <MapPin className="h-4 w-4" />
                  Check In Now
                </Button>
                <p className="mt-2 text-xs text-center text-muted-foreground">
                  {shop.shop_checkins?.[0]?.count || 0} people have checked in here
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Check-ins</CardTitle>
                <CardDescription>See who's been here recently</CardDescription>
              </CardHeader>
              <CardContent>
                {recentCheckins && recentCheckins.length > 0 ? (
                  <div className="space-y-4">
                    {recentCheckins.map((checkin) => (
                      <div key={checkin.id} className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                          <Image
                            src={checkin.profiles?.avatar_url || "/placeholder.svg?height=32&width=32&query=user"}
                            alt={checkin.profiles?.username || "User"}
                            width={32}
                            height={32}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{checkin.profiles?.username || "Anonymous"}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(checkin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-center text-muted-foreground py-4">No recent check-ins</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Shop Stats</CardTitle>
                <CardDescription>Information about this shop</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Check-ins:</span>
                    <span className="font-medium">{shop.shop_checkins?.[0]?.count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Flavors:</span>
                    <span className="font-medium">{shop.shop_flavors?.length || 0}</span>
                  </div>
                  {shop.rating && (
                    <div className="flex justify-between">
                      <span className="text-sm">Rating:</span>
                      <span className="font-medium flex items-center">
                        {shop.rating.toFixed(1)}
                        <Star className="ml-1 h-3 w-3 fill-yellow-400 text-yellow-400" />
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href={`/dashboard/shops/map?shop=${params.id}`}>
                    <MapPin className="mr-2 h-4 w-4" />
                    View on Map
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  Save to Favorites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  } catch (error) {
    console.error("Error in ShopDetailPage:", error)
    notFound()
  }
}
