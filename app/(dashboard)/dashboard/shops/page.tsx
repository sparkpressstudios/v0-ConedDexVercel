import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import ShopsDirectory from "@/components/shop/shops-directory"
import ShopsPageSkeleton from "@/components/shop/shops-page-skeleton"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Ice Cream Shops | ConeDex",
  description: "Discover and explore ice cream shops in your area with ConeDex",
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  try {
    // Fetch initial shops data with proper error handling
    const { data: initialShops, error } = await supabase
      .from("shops")
      .select(`
        id,
        name,
        description,
        address,
        city,
        state,
        zip,
        country,
        latitude,
        longitude,
        rating,
        image_url,
        website,
        phone,
        is_active,
        is_verified,
        created_at,
        updated_at,
        shop_checkins(count),
        shop_flavors(count)
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(12)

    if (error) {
      console.error("Error fetching shops:", error)
      throw error
    }

    // Process data to get check-in counts
    const processedShops =
      initialShops?.map((shop) => ({
        ...shop,
        check_in_count: shop.shop_checkins?.[0]?.count || 0,
        flavor_count: shop.shop_flavors?.[0]?.count || 0,
        mainImage: shop.image_url, // Ensure consistent property naming
      })) || []

    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ice Cream Shops</h1>
          <p className="text-muted-foreground">Discover and explore ice cream shops in your area</p>
        </div>

        <Suspense fallback={<ShopsPageSkeleton />}>
          <ShopsDirectory initialShops={processedShops} searchParams={searchParams} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Error in ShopsPage:", error)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Ice Cream Shops</h1>
          <p className="text-muted-foreground">Discover and explore ice cream shops in your area</p>
        </div>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700">Unable to load shops</h2>
          <p className="mt-2 text-red-600">We encountered an issue while loading the shops. Please try again later.</p>
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
