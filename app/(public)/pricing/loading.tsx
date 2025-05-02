import { Skeleton } from "@/components/ui/skeleton"

export default function PricingLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section Skeleton */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <Skeleton className="mx-auto mb-6 h-16 w-1/2" />
            <Skeleton className="mx-auto mb-8 h-24 w-2/3" />
          </div>
        </div>
      </section>

      {/* Pricing Cards Skeleton */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <Skeleton key={i} className="h-[500px] w-full rounded-lg" />
              ))}
          </div>
        </div>
      </section>
    </div>
  )
}
