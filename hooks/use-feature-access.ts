"use client"

import { useState, useEffect } from "react"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export function useFeatureAccess(featureKey: string) {
  const [hasAccess, setHasAccess] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    async function checkAccess() {
      if (!user) {
        setHasAccess(false)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        setError(null)

        const supabase = createClient()

        // Get the shop ID for the current user
        const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).single()

        if (!shop) {
          setHasAccess(false)
          setIsLoading(false)
          return
        }

        // Check if the business has access to this feature
        const access = await SubscriptionService.hasFeatureAccess(shop.id, featureKey)
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
  }, [featureKey, user])

  return { hasAccess, isLoading, error }
}
