import { createClient } from "@/lib/supabase/client"
import { createServerClient } from "@/lib/supabase/server"
import { createPagesServerClient } from "@/lib/supabase/pages-server"

export type SubscriptionTier = {
  id: string
  name: string
  description: string | null
  price: number
  billing_period: string
  is_active: boolean
}

export type FeatureDefinition = {
  id: string
  name: string
  description: string | null
  key: string
  category: string | null
  is_active: boolean
}

export type BusinessSubscription = {
  id: string
  business_id: string
  subscription_tier_id: string
  status: string
  start_date: string
  end_date: string | null
  is_auto_renew: boolean
  tier?: SubscriptionTier
  features?: FeatureDefinition[]
}

export class SubscriptionService {
  /**
   * Get the current subscription for a business
   */
  static async getBusinessSubscription(businessId: string): Promise<BusinessSubscription | null> {
    const supabase = createClient()

    const { data: subscription, error } = await supabase
      .from("business_subscriptions")
      .select(`
        *,
        tier:subscription_tier_id(*)
      `)
      .eq("business_id", businessId)
      .single()

    if (error || !subscription) {
      console.error("Error fetching business subscription:", error)
      return null
    }

    // Get features for this subscription tier
    const { data: features, error: featuresError } = await supabase
      .from("subscription_features")
      .select(`
        feature:feature_id(*)
      `)
      .eq("subscription_tier_id", subscription.subscription_tier_id)

    if (featuresError) {
      console.error("Error fetching subscription features:", featuresError)
    }

    return {
      ...subscription,
      features: features?.map((f) => f.feature) || [],
    }
  }

  /**
   * Check if a business has access to a specific feature
   */
  static async hasFeatureAccess(businessId: string, featureKey: string): Promise<boolean> {
    const supabase = createClient()

    // First check if the business has an active subscription
    const { data: subscription, error: subError } = await supabase
      .from("business_subscriptions")
      .select("id, subscription_tier_id, status")
      .eq("business_id", businessId)
      .eq("status", "active")
      .single()

    if (subError || !subscription) {
      return false
    }

    // Then check if the subscription tier includes the requested feature
    const { data: feature, error: featureError } = await supabase
      .from("subscription_features")
      .select(`
        id,
        feature:feature_id(key)
      `)
      .eq("subscription_tier_id", subscription.subscription_tier_id)
      .filter("feature.key", "eq", featureKey)
      .single()

    if (featureError || !feature) {
      return false
    }

    return true
  }

  /**
   * Get all available subscription tiers
   */
  static async getSubscriptionTiers(): Promise<SubscriptionTier[]> {
    const supabase = createClient()

    const { data: tiers, error } = await supabase
      .from("subscription_tiers")
      .select("*")
      .eq("is_active", true)
      .order("price", { ascending: true })

    if (error) {
      console.error("Error fetching subscription tiers:", error)
      return []
    }

    return tiers
  }

  /**
   * Get features for a specific subscription tier
   */
  static async getTierFeatures(tierId: string): Promise<FeatureDefinition[]> {
    const supabase = createClient()

    const { data: features, error } = await supabase
      .from("subscription_features")
      .select(`
        feature:feature_id(*)
      `)
      .eq("subscription_tier_id", tierId)

    if (error) {
      console.error("Error fetching tier features:", error)
      return []
    }

    return features.map((f) => f.feature)
  }

  /**
   * Update a business's subscription
   */
  static async updateBusinessSubscription(
    businessId: string,
    tierId: string,
    userId: string,
  ): Promise<BusinessSubscription | null> {
    const supabase = createClient()

    // Get the current subscription if it exists
    const { data: currentSub } = await supabase
      .from("business_subscriptions")
      .select("id, subscription_tier_id")
      .eq("business_id", businessId)
      .single()

    // Start a transaction
    const { data: subscription, error } = await supabase.rpc("update_business_subscription", {
      p_business_id: businessId,
      p_tier_id: tierId,
      p_user_id: userId,
      p_previous_tier_id: currentSub?.subscription_tier_id || null,
    })

    if (error) {
      console.error("Error updating business subscription:", error)
      return null
    }

    return this.getBusinessSubscription(businessId)
  }

  /**
   * Server-side function to check feature access
   */
  static async serverHasFeatureAccess(businessId: string, featureKey: string): Promise<boolean> {
    // Use the appropriate server client based on the environment
    let supabase

    try {
      // Try to use App Router server client
      supabase = createServerClient()
    } catch (e) {
      // Fall back to Pages Router server client if App Router client fails
      supabase = createPagesServerClient()
    }

    // First check if the business has an active subscription
    const { data: subscription, error: subError } = await supabase
      .from("business_subscriptions")
      .select("id, subscription_tier_id, status")
      .eq("business_id", businessId)
      .eq("status", "active")
      .single()

    if (subError || !subscription) {
      return false
    }

    // Then check if the subscription tier includes the requested feature
    const { data: feature, error: featureError } = await supabase
      .from("subscription_features")
      .select(`
        id,
        feature:feature_id(key)
      `)
      .eq("subscription_tier_id", subscription.subscription_tier_id)
      .filter("feature.key", "eq", featureKey)
      .single()

    if (featureError || !feature) {
      return false
    }

    return true
  }
}
