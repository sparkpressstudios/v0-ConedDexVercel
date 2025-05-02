import { Loader2 } from "lucide-react"

export default function SubscriptionLoading() {
  return (
    <div className="flex items-center justify-center p-12">
      <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
    </div>
  )
}
