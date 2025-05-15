import ShopsPageSkeleton from "@/components/shop/shops-page-skeleton"

export default function ExploreShopsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="h-10 w-3/4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-6 w-1/2 bg-gray-200 rounded animate-pulse"></div>
      </div>
      <ShopsPageSkeleton />
    </div>
  )
}
