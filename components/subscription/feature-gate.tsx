"use client"

import { type ReactNode, useState, useEffect } from "react"
import { useFeatureAccess } from "@/hooks/use-feature-access"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { LockIcon } from "lucide-react"

interface FeatureGateProps {
  featureKey: string
  children: ReactNode
  fallback?: ReactNode
  showUpgradeLink?: boolean
}

export function FeatureGate({ featureKey, children, fallback, showUpgradeLink = true }: FeatureGateProps) {
  const { hasAccess, isLoading } = useFeatureAccess(featureKey)
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Don't render anything on the server to prevent hydration mismatch
  if (!isClient) return null

  // While loading, show nothing to prevent flashing
  if (isLoading) return null

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
            onClick={() => router.push("/dashboard/shop/subscription")}
          >
            View Subscription Plans
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
