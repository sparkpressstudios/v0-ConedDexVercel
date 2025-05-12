import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function EditQuestLoading() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-6 w-[150px]" />

      <div>
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[350px] mt-2" />
      </div>

      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-[200px]" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-5 w-[100px]" />
            <Skeleton className="h-10 w-full" />
          </div>

          <div className="space-y-2">
            <Skeleton className="h-5 w-[150px]" />
            <Skeleton className="h-24 w-full" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          <Skeleton className="h-6 w-[200px]" />

          <div className="space-y-4 border rounded-md p-4">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
          </div>

          <Skeleton className="h-6 w-[200px]" />

          <div className="space-y-4 border rounded-md p-4">
            {Array(2)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="space-y-2 pb-4 border-b last:border-0 last:pb-0">
                  <div className="flex justify-between">
                    <Skeleton className="h-5 w-[200px]" />
                    <Skeleton className="h-8 w-[80px]" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))}
          </div>

          <div className="flex justify-end gap-2">
            <Skeleton className="h-10 w-[120px]" />
            <Skeleton className="h-10 w-[120px]" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
