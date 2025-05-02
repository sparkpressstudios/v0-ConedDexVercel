"use client"

import { useState, useEffect } from "react"
import { SubscriptionService } from "@/lib/services/subscription-service"

export function useFeatureAccess(businessId: string | undefined, featureKey: string) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function checkAccess() {
      if (!businessId) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const access = await SubscriptionService.hasFeatureAccess(businessId, featureKey)
        setHasAccess(access)
      } catch (err) {
        console.error("Error checking feature access:", err)
        setError(err instanceof Error ? err : new Error(String(err)))
        setHasAccess(false)
      } finally {
        setIsLoading(false)
      }
    }

    checkAccess()
  }, [businessId, featureKey])

  return { hasAccess, isLoading, error }
}
