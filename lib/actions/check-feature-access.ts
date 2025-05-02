"use server"

import { SubscriptionService } from "@/lib/services/subscription-service"
import { createServerClient } from "@/lib/supabase/server"

export async function checkFeatureAccess(businessId: string, featureKey: string): Promise<boolean> {
  try {
    return await SubscriptionService.serverHasFeatureAccess(businessId, featureKey)
  } catch (error) {
    console.error("Error checking feature access:", error)
    return false
  }
}

export async function getCurrentUserShopId(): Promise<string | null> {
  try {
    const supabase = createServerClient()

    // Get the current user
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session?.user) {
      return null
    }

    // Get the shop owned by the user
    const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", session.user.id).single()

    return shop?.id || null
  } catch (error) {
    console.error("Error getting current user shop:", error)
    return null
  }
}
