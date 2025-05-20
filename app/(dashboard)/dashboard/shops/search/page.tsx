import { Suspense } from "react"
import { ShopSearchResults } from "@/components/shop/shop-search-results"
import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Search Shops | ConeDex",
  description: "Search for ice cream shops in the ConeDex database",
}

export default function ShopSearchPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const query = typeof searchParams.q === "string" ? searchParams.q : ""

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard/shops">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Shops</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shop Search Results</h1>
          {query && <p className="text-muted-foreground">Results for "{query}"</p>}
        </div>
      </div>

      <Suspense
        fallback={
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                    <Skeleton className="h-6 w-16" />
                  </div>
                  <Skeleton className="mt-4 h-4 w-full" />
                  <div className="mt-2 flex gap-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-5 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <ShopSearchResults query={query} />
      </Suspense>
    </div>
  )
}
