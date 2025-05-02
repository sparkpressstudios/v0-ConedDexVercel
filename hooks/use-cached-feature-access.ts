"use client"

import { useState, useEffect, useCallback } from "react"
import { SubscriptionService } from "@/lib/services/subscription-service"

// In-memory cache for feature access
const featureAccessCache = new Map<string, { access: boolean; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

export function useCachedFeatureAccess(businessId: string | undefined, featureKey: string) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const cacheKey = `${businessId}:${featureKey}`

  const clearCache = useCallback(() => {
    featureAccessCache.delete(cacheKey)
  }, [cacheKey])

  useEffect(() => {
    async function checkAccess() {
      if (!businessId) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)

        // Check cache first
        const cachedValue = featureAccessCache.get(cacheKey)
        const now = Date.now()

        if (cachedValue && now - cachedValue.timestamp < CACHE_TTL) {
          setHasAccess(cachedValue.access)
          setIsLoading(false)
          return
        }

        // Cache miss or expired, fetch from service
        const access = await SubscriptionService.hasFeatureAccess(businessId, featureKey)

        // Update cache
        featureAccessCache.set(cacheKey, {
          access,
          timestamp: now,
        })

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
  }, [businessId, featureKey, cacheKey])

  return { hasAccess, isLoading, error, clearCache }
}
