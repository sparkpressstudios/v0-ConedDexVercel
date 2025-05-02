"use client"

import type { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Loader2 } from "lucide-react"
import Link from "next/link"
import { useFeatureAccess } from "@/hooks/use-feature-access"

interface FeatureGateProps {
  businessId: string
  featureKey: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeLink?: boolean
  title?: string
  description?: string
}

export function FeatureGate({
  businessId,
  featureKey,
  children,
  fallback,
  showUpgradeLink = true,
  title = "Premium Feature",
  description = "This feature requires a higher subscription tier.",
}: FeatureGateProps) {
  const { hasAccess, isLoading, error } = useFeatureAccess(businessId, featureKey)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    console.error("Error checking feature access:", error)
  }

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
