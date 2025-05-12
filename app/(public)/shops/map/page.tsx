import ClientMapsLoader from "@/components/maps/client-maps-loader"
import PublicShopsMap from "@/components/shop/public-shops-map"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ice Cream Shop Map | ConeDex",
  description: "Find ice cream shops near you with the ConeDex shop map",
}

export default function ShopMapPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Ice Cream Shop Map</h1>
      <p className="text-muted-foreground mb-6">
        Discover ice cream shops near you. Click on a shop to see details about it.
      </p>

      <ClientMapsLoader>
        <PublicShopsMap />
      </ClientMapsLoader>
    </div>
  )
}
