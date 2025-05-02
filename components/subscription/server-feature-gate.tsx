import type { ReactNode } from "react"
import { checkFeatureAccess, getCurrentUserShopId } from "@/lib/actions/check-feature-access"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock } from "lucide-react"
import Link from "next/link"

interface ServerFeatureGateProps {
  featureKey: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeLink?: boolean
  title?: string
  description?: string
}

export async function ServerFeatureGate({
  featureKey,
  children,
  fallback,
  showUpgradeLink = true,
  title = "Premium Feature",
  description = "This feature requires a higher subscription tier.",
}: ServerFeatureGateProps) {
  const shopId = await getCurrentUserShopId()

  if (!shopId) {
    return (
      fallback || (
        <Card className="border-dashed">
          <CardHeader>
            <CardTitle>Shop Not Found</CardTitle>
            <CardDescription>You need to create a shop to access this feature.</CardDescription>
          </CardHeader>
        </Card>
      )
    )
  }

  const hasAccess = await checkFeatureAccess(shopId, featureKey)

  if (hasAccess) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
          <p>This feature is not available on your current subscription plan.</p>
        </div>
      </CardContent>
      {showUpgradeLink && (
        <CardFooter>
          <Link href="/dashboard/shop/subscription" className="w-full">
            <Button className="w-full">Upgrade Subscription</Button>
          </Link>
        </CardFooter>
      )}
    </Card>
  )
}
