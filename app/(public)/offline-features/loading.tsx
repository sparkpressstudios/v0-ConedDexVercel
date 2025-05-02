import { Skeleton } from "@/components/ui/skeleton"

export default function DownloadPageLoading() {
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Hero Section Loading */}
        <div className="text-center mb-16">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-8" />
          <Skeleton className="h-6 w-full max-w-3xl mx-auto mb-2" />

          <div className="relative mx-auto w-full max-w-md p-6 bg-gradient-to-b from-primary/10 to-background rounded-xl mb-8">
            <Skeleton className="h-[180px] w-[180px] rounded-xl mx-auto" />
          </div>

          <Skeleton className="h-14 w-64 mx-auto mt-8 rounded-full" />
          <Skeleton className="h-4 w-72 mx-auto mt-4" />
        </div>

        {/* Installation Instructions Loading */}
        <div className="mb-16">
          <Skeleton className="h-10 w-64 mx-auto mb-6" />
          <div className="grid gap-6 md:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={`install-${i}`} className="h-[180px] w-full rounded-lg" />
              ))}
          </div>
        </div>

        {/* Benefits Section Loading */}
        <Skeleton className="h-10 w-64 mx-auto mb-6" />
        <div className="grid gap-6 md:grid-cols-2 mb-12">
          {Array(4)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={`benefit-${i}`} className="h-[200px] w-full rounded-lg" />
            ))}
        </div>

        {/* Offline Features Loading */}
        <Skeleton className="h-[200px] w-full rounded-lg mb-12" />

        {/* Final CTA Loading */}
        <div className="text-center">
          <Skeleton className="h-8 w-96 mx-auto mb-4" />
          <Skeleton className="h-14 w-64 mx-auto rounded-full" />
        </div>
      </div>
    </div>
  )
}
