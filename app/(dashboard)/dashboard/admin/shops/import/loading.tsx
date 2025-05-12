import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ShopImportLoading() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-4 w-[300px] mt-2" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[250px]" />
          <Skeleton className="h-4 w-[350px]" />
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[100px]" />
              <div className="ml-5 space-y-2">
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[180px]" />
                <Skeleton className="h-4 w-[220px]" />
                <Skeleton className="h-4 w-[190px]" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-[100px]" />
              <div className="ml-5 space-y-2">
                <Skeleton className="h-4 w-[210px]" />
                <Skeleton className="h-4 w-[190px]" />
                <Skeleton className="h-4 w-[200px]" />
                <Skeleton className="h-4 w-[180px]" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0 w-full">
            <Skeleton className="h-10 flex-1" />
            <Skeleton className="h-10 flex-1" />
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="web-scraping">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="web-scraping" disabled>
            Web Scraping
          </TabsTrigger>
          <TabsTrigger value="csv-import" disabled>
            CSV Import
          </TabsTrigger>
          <TabsTrigger value="manual-entry" disabled>
            Manual Entry
          </TabsTrigger>
        </TabsList>

        <TabsContent value="web-scraping">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-[100px]" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-[300px]" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-[150px]" />
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[150px]" />
          <Skeleton className="h-4 w-[250px]" />
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
            <Skeleton className="h-10 w-[150px] mt-4" />
          </div>
          <div className="rounded-lg border p-4">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-4 w-[250px] mt-2" />
            <Skeleton className="h-10 w-[150px] mt-4" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
