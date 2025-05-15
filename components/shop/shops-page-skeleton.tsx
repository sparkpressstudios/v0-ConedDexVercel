import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, List, Map, SlidersHorizontal } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ShopsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-lg border bg-card p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search shops by name or location..." className="pl-8" disabled />
          </div>
          <Button type="submit" variant="default" disabled>
            Search
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Tabs defaultValue="list" className="w-[200px]">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-1" disabled>
                <List className="h-4 w-4" />
                <span>List</span>
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-1" disabled>
                <Map className="h-4 w-4" />
                <span>Map</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Button variant="outline" size="icon" className="ml-2" disabled>
            <SlidersHorizontal className="h-4 w-4" />
            <span className="sr-only">Filters</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64 mt-2" />
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  )
}
