import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/server"
import { getFlavorStatistics } from "@/lib/services/ai-flavor-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Calendar,
  ChevronLeft,
  Clock,
  MapPin,
  Star,
  Store,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: flavor } = await supabase.from("flavors").select("name, description").eq("id", params.id).single()

  if (!flavor) {
    return {
      title: "Flavor Not Found | ConeDex",
      description: "The requested flavor could not be found in the ConeDex.",
    }
  }

  return {
    title: `${flavor.name} | ConeDex`,
    description: flavor.description || `Learn about ${flavor.name} in the ConeDex global flavor collection.`,
  }
}

export default async function FlavorDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get flavor details
  const { data: flavor, error } = await supabase
    .from("flavors")
    .select(`
      id,
      name,
      description,
      category,
      image_url,
      tags,
      created_at
    `)
    .eq("id", params.id)
    .single()

  if (error || !flavor) {
    notFound()
  }

  // Get flavor statistics
  const stats = await getFlavorStatistics(flavor.id)

  // Get similar flavors
  const { data: similarFlavors } = await supabase
    .from("flavors")
    .select("id, name, image_url, category")
    .eq("category", flavor.category)
    .neq("id", flavor.id)
    .limit(4)

  return (
    <div className="container py-10 max-w-7xl">
      <Link href="/conedex" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-6">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to ConeDex
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="sticky top-6">
            <div className="aspect-square relative rounded-lg overflow-hidden bg-muted mb-4">
              <Image
                src={flavor.image_url || "/colorful-ice-cream-cones.png"}
                alt={flavor.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
                priority
              />
            </div>

            <h1 className="text-2xl font-bold mb-2">{flavor.name}</h1>

            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="secondary">{flavor.category || "Uncategorized"}</Badge>
              {stats?.popularityTrend === "rising" && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Rising
                </Badge>
              )}
              {stats?.popularityTrend === "declining" && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Declining
                </Badge>
              )}
              {flavor.tags?.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>

            {flavor.description && <p className="text-muted-foreground mb-6">{flavor.description}</p>}

            <Button className="w-full mb-2">
              <Star className="h-4 w-4 mr-2" />
              Log This Flavor
            </Button>

            <Button variant="outline" className="w-full">
              <MapPin className="h-4 w-4 mr-2" />
              Find Where to Try
            </Button>
          </div>
        </div>

        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Flavor Statistics</CardTitle>
              <CardDescription>Data collected from ConeDex users who have logged this flavor</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Users className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">{stats?.totalCaptures || 0}</div>
                  <p className="text-xs text-muted-foreground">Total Captures</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Store className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">{stats?.uniqueShops || 0}</div>
                  <p className="text-xs text-muted-foreground">Unique Shops</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {stats?.averageRating ? stats.averageRating.toFixed(1) : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">Average Rating</p>
                </div>

                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <Calendar className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
                  <div className="text-2xl font-bold">
                    {stats?.firstLogged ? new Date(stats.firstLogged).getFullYear() : "N/A"}
                  </div>
                  <p className="text-xs text-muted-foreground">First Logged</p>
                </div>
              </div>

              {stats?.topShops && stats.topShops.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-3">Top Shops Serving This Flavor</h3>
                  <div className="space-y-3">
                    {stats.topShops.map((shop) => (
                      <div key={shop.id} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Store className="h-4 w-4 mr-2 text-muted-foreground" />
                          <span>{shop.name}</span>
                        </div>
                        <Badge variant="outline">{shop.count} captures</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Tabs defaultValue="activity">
            <TabsList className="w-full">
              <TabsTrigger value="activity" className="flex-1">
                <Clock className="h-4 w-4 mr-2" />
                Recent Activity
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex-1">
                <BarChart className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="activity" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Captures</CardTitle>
                  <CardDescription>Latest logs of this flavor from ConeDex users</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This would be populated with real data in a production environment */}
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Recent activity data is being collected</p>
                    <p className="text-sm">Check back soon for updates</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Flavor Analytics</CardTitle>
                  <CardDescription>Trends and patterns for this flavor</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* This would be populated with real data in a production environment */}
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Analytics data is being collected</p>
                    <p className="text-sm">Check back soon for detailed analytics</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {similarFlavors && similarFlavors.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-4">Similar Flavors</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {similarFlavors.map((similar) => (
                  <Link href={`/conedex/${similar.id}`} key={similar.id} className="group">
                    <div className="border rounded-lg overflow-hidden transition-all hover:shadow-md">
                      <div className="aspect-square relative bg-muted">
                        <Image
                          src={similar.image_url || "/colorful-ice-cream-cones.png"}
                          alt={similar.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                          sizes="(max-width: 768px) 50vw, 25vw"
                        />
                      </div>
                      <div className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1">{similar.name}</h3>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {similar.category || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
