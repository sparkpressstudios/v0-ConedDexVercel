"use client"

import { useState, useEffect } from "react"
import { useFeatureAccess } from "@/hooks/use-feature-access"

export function useCachedFeatureAccess(featureKey: string) {
  const { hasAccess, isLoading, error } = useFeatureAccess(featureKey)
  const [cachedAccess, setCachedAccess] = useState<boolean | null>(null)
  const [isOffline, setIsOffline] = useState<boolean>(false)

  useEffect(() => {
    // Check if we're online
    const handleOnlineStatus = () => {
      setIsOffline(!navigator.onLine)
    }

    // Set initial status
    setIsOffline(!navigator.onLine)

    // Add event listeners
    window.addEventListener("online", handleOnlineStatus)
    window.addEventListener("offline", handleOnlineStatus)

    // Clean up
    return () => {
      window.removeEventListener("online", handleOnlineStatus)
      window.removeEventListener("offline", handleOnlineStatus)
    }
  }, [])

  useEffect(() => {
    // If we have a definitive answer and we're online, cache it
    if (!isLoading && !error && navigator.onLine) {
      setCachedAccess(hasAccess)

      // Also store in localStorage for persistent caching
      try {
        localStorage.setItem(
          `feature_access:${featureKey}`,
          JSON.stringify({
            hasAccess,
            timestamp: Date.now(),
          }),
        )
      } catch (e) {
        console.error("Error storing feature access in localStorage:", e)
      }
    }
  }, [hasAccess, isLoading, error, featureKey])

  useEffect(() => {
    // If we're offline or loading, try to get from cache
    if ((isOffline || isLoading) && cachedAccess === null) {
      try {
        const cached = localStorage.getItem(`feature_access:${featureKey}`)
        if (cached) {
          const { hasAccess, timestamp } = JSON.parse(cached)

          // Only use cache if it's less than 24 hours old
          const cacheAge = Date.now() - timestamp
          if (cacheAge < 24 * 60 * 60 * 1000) {
            setCachedAccess(hasAccess)
          }
        }
      } catch (e) {
        console.error("Error retrieving feature access from localStorage:", e)
      }
    }
  }, [isOffline, isLoading, featureKey, cachedAccess])

  // If we're offline, use cached value
  // If we're online but still loading, use cached value as a fallback
  // Otherwise use the real value
  const effectiveHasAccess = isOffline || (isLoading && cachedAccess !== null) ? cachedAccess || false : hasAccess

  return {
    hasAccess: effectiveHasAccess,
    isLoading: isLoading && cachedAccess === null,
    error,
    isOffline,
  }
}
