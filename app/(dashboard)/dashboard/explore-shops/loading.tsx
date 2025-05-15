import ShopsPageSkeleton from "@/components/shop/shops-page-skeleton"

export default function ExploreShopsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-purple-900">Explore Ice Cream Shops</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Discover delicious ice cream shops, track your visits, and share your experiences
        </p>
      </div>
      <ShopsPageSkeleton />
    </div>
  )
}
