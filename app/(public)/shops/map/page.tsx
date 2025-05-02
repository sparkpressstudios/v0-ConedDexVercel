import { Suspense } from "react"
import { PublicShopsMap } from "@/components/shop/public-shops-map"
import { ShopsMapSkeleton } from "@/components/shop/shops-map-skeleton"

export const metadata = {
  title: "Ice Cream Shops Map | ConeDex",
  description: "Discover ice cream shops near you with the ConeDex interactive map",
}

export default function PublicShopsMapPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-2">Ice Cream Shops</h1>
      <p className="text-muted-foreground mb-6">Discover amazing ice cream shops near you</p>

      <Suspense fallback={<ShopsMapSkeleton />}>
        <PublicShopsMap />
      </Suspense>
    </div>
  )
}
