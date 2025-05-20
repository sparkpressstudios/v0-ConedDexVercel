import type { ReactNode } from "react"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { LockIcon } from "lucide-react"

interface ServerFeatureGateProps {
  featureKey: string
  businessId: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeLink?: boolean
}

export async function ServerFeatureGate({
  featureKey,
  businessId,
  children,
  fallback,
  showUpgradeLink = true,
}: ServerFeatureGateProps) {
  // Check if the business has access to this feature
  const hasAccess = await SubscriptionService.serverHasFeatureAccess(businessId, featureKey)

  // If the user has access, show the children
  if (hasAccess) return <>{children}</>

  // If a fallback is provided, show that
  if (fallback) return <>{fallback}</>

  // Otherwise, show a default message
  return (
    <Alert className="bg-amber-50 border-amber-200">
      <LockIcon className="h-4 w-4 text-amber-600" />
      <AlertTitle>Premium Feature</AlertTitle>
      <AlertDescription className="flex flex-col gap-2">
        <p>This feature requires a premium subscription.</p>
        {showUpgradeLink && (
          <Button
            variant="outline"
            size="sm"
            className="self-start mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
            href="/dashboard/shop/subscription"
          >
            View Subscription Plans
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
