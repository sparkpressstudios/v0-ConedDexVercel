import { Skeleton } from "@/components/ui/skeleton"

// Named export
export function ShopsMapSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-[600px] w-full rounded-lg" />
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="h-6 w-32" />
      </div>
    </div>
  )
}

// Default export (same component)
export default ShopsMapSkeleton
