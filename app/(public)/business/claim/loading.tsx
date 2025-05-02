import { Skeleton } from "@/components/ui/skeleton"

export default function BusinessClaimLoading() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-12 text-center">
          <Skeleton className="mx-auto mb-4 h-10 w-1/3" />
          <Skeleton className="mx-auto h-6 w-1/2" />
        </div>

        <Skeleton className="mb-6 h-12 w-full" />

        <Skeleton className="h-[600px] w-full rounded-lg" />

        <div className="mt-12">
          <Skeleton className="mb-4 h-8 w-1/4" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-40 w-full rounded-lg" />
              ))}
          </div>
        </div>

        <div className="mt-12 text-center">
          <Skeleton className="mx-auto mb-4 h-6 w-1/3" />
          <Skeleton className="mx-auto h-10 w-40" />
        </div>
      </div>
    </div>
  )
}
