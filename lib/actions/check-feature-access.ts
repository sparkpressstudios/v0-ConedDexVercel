"use server"

import { SubscriptionService } from "@/lib/services/subscription-service"
import { createServerClient } from "@/lib/supabase/server"

export async function checkFeatureAccess(userId: string, featureKey: string): Promise<boolean> {
  try {
    const supabase = createServerClient()

    // Get the shop ID for the user
    const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", userId).single()

    if (!shop) {
      return false
    }

    // Check if the business has access to this feature
    return await SubscriptionService.serverHasFeatureAccess(shop.id, featureKey)
  } catch (error) {
    console.error("Error checking feature access:", error)
    return false
  }
}
