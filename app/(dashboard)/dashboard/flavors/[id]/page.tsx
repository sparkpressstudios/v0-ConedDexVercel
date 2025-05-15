import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FlavorDetailView } from "@/components/flavor/flavor-detail-view"
import { FlavorRecommendations } from "@/components/flavor/flavor-recommendations"
import { FlavorComparison } from "@/components/flavor/flavor-comparison"
import { IceCream, MapPin, Star, Calendar, ArrowLeft, Tag, Info, Store } from "lucide-react"

interface FlavorPageProps {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: FlavorPageProps): Promise<Metadata> {
  const supabase = createServerClient()

  const { data: flavor } = await supabase
    .from("flavor_logs")
    .select(`
      id,
      name,
      description,
      shops:shop_id (name)
    `)
    .eq("id", params.id)
    .single()

  if (!flavor) {
    return {
      title: "Flavor Not Found | ConeDex",
      description: "The requested flavor could not be found",
    }
  }

  return {
    title: `${flavor.name} | ConeDex`,
    description: flavor.description || `Details about ${flavor.name} at ${flavor.shops?.name || "Unknown Shop"}`,
  }
}

export default async function FlavorPage({ params }: FlavorPageProps) {
  const supabase = createServerClient()

  // Get the flavor details
  const { data: flavor, error } = await supabase
    .from("flavor_logs")
    .select(`
      id,
      name,
      description,
      rating,
      notes,
      image_url,
      created_at,
      category,
      tags,
      shops:shop_id (
        id,
        name,
        address,
        city,
        state,
        image_url
      ),
      profiles:user_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !flavor) {
    notFound()
  }

  // Get similar flavors
  const { data: similarFlavors } = await supabase
    .from("flavor_logs")
    .select(`
      id,
      name,
      rating,
      image_url,
      shops:shop_id (name)
    `)
    .neq("id", params.id)
    .eq("category", flavor.category)
    .order("rating", { ascending: false })
    .limit(3)

  // Format the date
  const createdAt = new Date(flavor.created_at)
  const formattedDate = createdAt.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Parse tags
  const flavorTags = Array.isArray(flavor.tags) ? flavor.tags : []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="gap-1">
          <Link href="/dashboard/flavors">
            <ArrowLeft className="h-4 w-4" />
            Back to Flavors
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{flavor.name}</CardTitle>
                  <CardDescription>
                    <Link
                      href={`/dashboard/shops/${flavor.shops?.id}`}
                      className="hover:underline flex items-center gap-1 mt-1"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      {flavor.shops?.name || "Unknown Shop"}
                    </Link>
                  </CardDescription>
                </div>
                <div className="flex items-center gap-1 bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{flavor.rating}/10</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="aspect-video relative rounded-md overflow-hidden mb-4">
                {flavor.image_url ? (
                  <Image src={flavor.image_url || "/placeholder.svg"} alt={flavor.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <IceCream className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-sm mb-1">Description</h3>
                  <p className="text-muted-foreground">{flavor.description || "No description provided."}</p>
                </div>

                {flavor.notes && (
                  <div>
                    <h3 className="font-medium text-sm mb-1">Tasting Notes</h3>
                    <p className="text-muted-foreground">{flavor.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  {flavorTags.map((tag, index) => (
                    <Badge key={index} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                    </Badge>
                  ))}
                  {flavor.category && (
                    <Badge variant="outline" className="flex items-center gap-1">
                      <IceCream className="h-3 w-3" />
                      {flavor.category}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="border-t pt-4 flex justify-between">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={flavor.profiles?.avatar_url || undefined} />
                  <AvatarFallback>{(flavor.profiles?.username || "U").substring(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  Logged by {flavor.profiles?.full_name || flavor.profiles?.username || "Anonymous"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {formattedDate}
              </div>
            </CardFooter>
          </Card>

          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="similar">Similar Flavors</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <FlavorDetailView flavor={flavor} />
            </TabsContent>
            <TabsContent value="similar">
              <Card>
                <CardHeader>
                  <CardTitle>Similar Flavors</CardTitle>
                  <CardDescription>Other {flavor.category} flavors you might enjoy</CardDescription>
                </CardHeader>
                <CardContent>
                  {similarFlavors && similarFlavors.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                      {similarFlavors.map((similar) => (
                        <Link href={`/dashboard/flavors/${similar.id}`} key={similar.id}>
                          <div className="group rounded-lg border p-3 hover:bg-accent transition-colors">
                            <div className="aspect-square relative rounded-md overflow-hidden mb-2">
                              {similar.image_url ? (
                                <Image
                                  src={similar.image_url || "/placeholder.svg"}
                                  alt={similar.name}
                                  fill
                                  className="object-cover"
                                />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center">
                                  <IceCream className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <h3 className="font-medium group-hover:text-primary transition-colors">{similar.name}</h3>
                            <div className="flex items-center justify-between mt-1">
                              <span className="text-xs text-muted-foreground">{similar.shops?.name}</span>
                              <div className="flex items-center gap-1 text-xs">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                                <span>{similar.rating}/10</span>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-muted-foreground">No similar flavors found</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="compare">
              <FlavorComparison currentFlavorId={flavor.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shop Details</CardTitle>
            </CardHeader>
            <CardContent>
              {flavor.shops ? (
                <div className="space-y-4">
                  <div className="aspect-video relative rounded-md overflow-hidden">
                    {flavor.shops.image_url ? (
                      <Image
                        src={flavor.shops.image_url || "/placeholder.svg"}
                        alt={flavor.shops.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-muted flex items-center justify-center">
                        <Store className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium">{flavor.shops.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {[flavor.shops.address, flavor.shops.city, flavor.shops.state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <Button asChild className="w-full">
                    <Link href={`/dashboard/shops/${flavor.shops.id}`}>View Shop</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Store className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">Shop information not available</p>
                </div>
              )}
            </CardContent>
          </Card>

          <FlavorRecommendations currentFlavorId={flavor.id} />
        </div>
      </div>
    </div>
  )
}
