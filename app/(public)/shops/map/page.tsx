import { Suspense } from "react"
import { ShopsMapSkeleton } from "@/components/shop/shops-map-skeleton"
import { SimplePublicShopsMap } from "@/components/shop/simple-public-shops-map"

export const metadata = {
  title: "Ice Cream Shops Map | ConeDex",
  description: "Discover ice cream shops near you with the ConeDex interactive map",
}

// This ensures this page is always dynamically rendered
export const dynamic = "force-dynamic"

export default function PublicShopsMapPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Ice Cream Shops</h1>
      <p className="text-muted-foreground mb-6">Discover amazing ice cream shops near you</p>

      <Suspense fallback={<ShopsMapSkeleton />}>
        <SimplePublicShopsMap />
      </Suspense>
    </div>
  )
}
