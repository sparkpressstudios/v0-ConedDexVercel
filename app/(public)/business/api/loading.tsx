import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-10">
      <div className="mb-12 text-center">
        <Skeleton className="h-12 w-3/4 mx-auto mb-4" />
        <Skeleton className="h-6 w-1/2 mx-auto" />
      </div>

      <div className="grid gap-12 md:grid-cols-2">
        <div>
          <Skeleton className="h-8 w-1/2 mb-6" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>

          <div className="mt-8">
            <Skeleton className="h-8 w-1/2 mb-6" />
            <div className="space-y-4">
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      </div>
    </div>
  )
}
