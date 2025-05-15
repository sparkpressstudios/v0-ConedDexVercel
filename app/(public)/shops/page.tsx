import { Suspense } from "react"
import ShopsPageClient from "@/components/shop/shops-page-client"
import ShopsPageSkeleton from "@/components/shop/shops-page-skeleton"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const metadata = {
  title: "Explore Ice Cream Shops | ConeDex",
  description: "Discover and explore ice cream shops in your area with ConeDex",
}

export default async function ShopsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Fetch initial shops data
  const { data: initialShops } = await supabase
    .from("shops")
    .select(`
      *,
      check_in_count:shop_checkins(count),
      flavor_count:shop_flavors(count)
    `)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(12)

  // Process data to get check-in counts
  const processedShops =
    initialShops?.map((shop) => ({
      ...shop,
      check_in_count: shop.check_in_count?.[0]?.count || 0,
      flavor_count: shop.flavor_count?.[0]?.count || 0,
    })) || []

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-900">Explore Ice Cream Shops</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover delicious ice cream shops, track your visits, and share your experiences
        </p>
      </div>

      <Suspense fallback={<ShopsPageSkeleton />}>
        <ShopsPageClient initialShops={processedShops} searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
