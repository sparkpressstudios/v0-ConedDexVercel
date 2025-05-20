import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ShopsMapClient from "@/components/shop/shops-map-client"
import ShopsMapSkeleton from "@/components/shop/shops-map-skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Shops Map | ConeDex",
  description: "Discover ice cream shops near you on an interactive map",
}

export default async function ShopsMapPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch shops with coordinates for the map
    const { data: shops, error } = await supabase
      .from("shops")
      .select(`
        id,
        name,
        description,
        address,
        city,
        state,
        zip,
        latitude,
        longitude,
        rating,
        image_url,
        is_verified,
        shop_checkins(count),
        shop_flavors(count)
      `)
      .eq("is_active", true)
      .not("latitude", "is", null)
      .not("longitude", "is", null)
      .order("created_at", { ascending: false })
      .limit(100)

    if (error) {
      console.error("Error fetching shops:", error)
      throw error
    }

    // Process data to get check-in counts
    const processedShops =
      shops?.map((shop) => ({
        ...shop,
        check_in_count: shop.shop_checkins?.[0]?.count || 0,
        flavor_count: shop.shop_flavors?.[0]?.count || 0,
        mainImage: shop.image_url,
      })) || []

    // Get highlighted shop ID if provided
    const highlightedShopId = typeof searchParams.shop === "string" ? searchParams.shop : undefined

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shops Map</h1>
          <p className="text-muted-foreground">Discover ice cream shops near you</p>
        </div>

        <Suspense fallback={<ShopsMapSkeleton />}>
          <ShopsMapClient shops={processedShops} highlightedShopId={highlightedShopId} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error in ShopsMapPage:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Shops Map</h1>
          <p className="text-muted-foreground">Discover ice cream shops near you</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700">Unable to load shops map</h2>
          <p className="mt-2 text-red-600">
            We encountered an issue while loading the shops map. Please try again later.
          </p>
          <div className="mt-4">
            <pre className="text-left text-xs text-red-500 bg-red-50 p-2 rounded overflow-auto max-w-full">
              {error instanceof Error ? error.message : "Unknown error"}
            </pre>
          </div>
        </div>
      </div>
    )
  }
}
