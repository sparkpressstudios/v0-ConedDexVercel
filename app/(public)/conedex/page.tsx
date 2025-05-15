import { Suspense } from "react"
import { getGlobalFlavorStatistics } from "@/lib/services/ai-flavor-service"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Filter, Grid3X3, List, Map, TrendingUp, Users } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import PublicConeDexSkeleton from "./loading"

export const metadata = {
  title: "ConeDex - Global Flavor Collection",
  description: "Explore the global collection of ice cream flavors logged by ConeDex users",
}

export default function PublicConeDexPage() {
  return (
    <div className="container py-10 max-w-7xl">
      <div className="flex flex-col gap-2 mb-8">
        <h1 className="text-4xl font-bold tracking-tight">The ConeDex</h1>
        <p className="text-xl text-muted-foreground">
          Explore the global collection of ice cream flavors logged by ConeDex users
        </p>
      </div>

      <Suspense fallback={<PublicConeDexSkeleton />}>
        <ConeDexContent />
      </Suspense>
    </div>
  )
}

async function ConeDexContent() {
  const flavors = await getGlobalFlavorStatistics()

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Users className="h-3.5 w-3.5 mr-1" />
            {flavors.reduce((sum, flavor) => sum + flavor.captureCount, 0)} Total Captures
          </Badge>
          <Badge variant="outline" className="px-3 py-1">
            {flavors.length} Unique Flavors
          </Badge>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
      </div>

      <Tabs defaultValue="grid">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">
              <Grid3X3 className="h-4 w-4 mr-2" />
              Grid
            </TabsTrigger>
            <TabsTrigger value="list">
              <List className="h-4 w-4 mr-2" />
              List
            </TabsTrigger>
            <TabsTrigger value="map">
              <Map className="h-4 w-4 mr-2" />
              Map
            </TabsTrigger>
            <TabsTrigger value="trending">
              <TrendingUp className="h-4 w-4 mr-2" />
              Trending
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="grid" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {flavors.map((flavor) => (
              <Link href={`/conedex/${flavor.id}`} key={flavor.id} className="group">
                <Card className="overflow-hidden h-full transition-all hover:shadow-md">
                  <div className="aspect-square relative bg-muted">
                    <Image
                      src={flavor.image_url || "/colorful-ice-cream-cones.png"}
                      alt={flavor.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-black/60 text-white">
                        {flavor.captureCount} captures
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{flavor.name}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{flavor.category || "Unknown"}</Badge>
                      {flavor.stats?.popularityTrend === "rising" && (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <TrendingUp className="h-3 w-3 mr-1" />
                          Rising
                        </Badge>
                      )}
                    </div>
                    <div className="mt-3 text-sm text-muted-foreground">
                      <div className="flex justify-between items-center">
                        <span>Found at {flavor.stats?.uniqueShops || 0} shops</span>
                        <span className="flex items-center">
                          {flavor.stats?.averageRating ? (
                            <>
                              <span className="text-amber-500 mr-1">★</span>
                              {flavor.stats.averageRating.toFixed(1)}
                            </>
                          ) : (
                            "No ratings"
                          )}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-0">
          <Card>
            <CardContent className="p-0">
              <div className="divide-y">
                {flavors.map((flavor) => (
                  <Link
                    href={`/conedex/${flavor.id}`}
                    key={flavor.id}
                    className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <Image
                        src={flavor.image_url || "/colorful-ice-cream-cones.png"}
                        alt={flavor.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{flavor.name}</h3>
                        <Badge variant="outline">{flavor.category || "Unknown"}</Badge>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <span className="mr-3">{flavor.captureCount} captures</span>
                        <span className="mr-3">{flavor.stats?.uniqueShops || 0} shops</span>
                        {flavor.stats?.averageRating ? (
                          <span className="flex items-center">
                            <span className="text-amber-500 mr-1">★</span>
                            {flavor.stats.averageRating.toFixed(1)}
                          </span>
                        ) : (
                          "No ratings"
                        )}
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Flavor Map</CardTitle>
              <CardDescription>Geographic distribution of ice cream flavors (coming soon)</CardDescription>
            </CardHeader>
            <CardContent className="h-[500px] flex items-center justify-center bg-muted/20">
              <div className="text-center">
                <Map className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-medium">Flavor Map Coming Soon</h3>
                <p className="text-muted-foreground max-w-md mx-auto mt-2">
                  We're working on a geographic visualization of where flavors have been captured around the world.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trending" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Trending Flavors</CardTitle>
              <CardDescription>Flavors gaining popularity in the ConeDex community</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {flavors
                  .filter((flavor) => flavor.stats?.popularityTrend === "rising")
                  .slice(0, 5)
                  .map((flavor, index) => (
                    <div key={flavor.id} className="flex items-center gap-4">
                      <div className="text-2xl font-bold text-muted-foreground w-8 text-center">#{index + 1}</div>
                      <div className="h-16 w-16 relative rounded-md overflow-hidden bg-muted flex-shrink-0">
                        <Image
                          src={flavor.image_url || "/colorful-ice-cream-cones.png"}
                          alt={flavor.name}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Link href={`/conedex/${flavor.id}`} className="hover:underline">
                          <h3 className="font-medium">{flavor.name}</h3>
                        </Link>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <span className="mr-3">{flavor.captureCount} captures</span>
                          <span className="mr-3">{flavor.stats?.uniqueShops || 0} shops</span>
                          {flavor.stats?.averageRating ? (
                            <span className="flex items-center">
                              <span className="text-amber-500 mr-1">★</span>
                              {flavor.stats.averageRating.toFixed(1)}
                            </span>
                          ) : (
                            "No ratings"
                          )}
                        </div>
                      </div>
                      <Badge className="bg-green-100 text-green-800 border-green-200">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Rising
                      </Badge>
                    </div>
                  ))}

                {flavors.filter((flavor) => flavor.stats?.popularityTrend === "rising").length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                    <h3 className="text-lg font-medium">No Trending Flavors Yet</h3>
                    <p className="text-muted-foreground max-w-md mx-auto mt-2">
                      As more users log flavors, we'll identify trending flavors in the community.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  )
}
