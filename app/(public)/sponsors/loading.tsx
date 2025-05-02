import { Skeleton } from "@/components/ui/skeleton"

export default function SponsorsLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <Skeleton className="mx-auto mb-4 h-12 w-3/4 max-w-2xl" />
        <Skeleton className="mx-auto h-20 w-full max-w-2xl" />
      </div>

      {/* Hero Stats Skeleton */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-64 w-full rounded-lg" />
        ))}
      </div>

      {/* Key Benefits Skeleton */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-48" />
          <Skeleton className="mx-auto h-16 w-full max-w-2xl" />
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-80 w-full rounded-lg" />
          ))}
        </div>
      </div>

      {/* Sponsorship Opportunities Skeleton */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-64" />
          <Skeleton className="mx-auto h-16 w-full max-w-2xl" />
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-72 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  )
}
