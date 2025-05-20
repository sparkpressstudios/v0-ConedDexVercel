import ShopsPageSkeleton from "@/components/shop/shops-page-skeleton"

export default function ShopsLoading() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Ice Cream Shops</h1>
        <p className="text-muted-foreground">Discover and explore ice cream shops in your area</p>
      </div>
      <ShopsPageSkeleton />
    </div>
  )
}
