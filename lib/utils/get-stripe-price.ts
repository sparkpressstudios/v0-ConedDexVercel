import { createServerClient } from "@/lib/supabase/server"

/**
 * Get the Stripe price ID for a subscription tier
 * @param tierId The subscription tier ID
 * @param billingPeriod The billing period (monthly or yearly)
 * @returns The Stripe price ID or null if not found
 */
export async function getStripePriceId(
  tierId: string,
  billingPeriod: "monthly" | "yearly" = "monthly",
): Promise<string | null> {
  try {
    const supabase = createServerClient()

    // Get the mapping for this tier and billing period
    const { data: mapping, error } = await supabase
      .from("subscription_tiers_stripe_mapping")
      .select("stripe_price_id")
      .eq("subscription_tier_id", tierId)
      .eq("billing_period", billingPeriod)
      .eq("is_active", true)
      .single()

    if (error || !mapping) {
      console.error(`No active Stripe price mapping found for tier ${tierId} with ${billingPeriod} billing period`)
      return null
    }

    return mapping.stripe_price_id
  } catch (error) {
    console.error("Error getting Stripe price ID:", error)
    return null
  }
}

/**
 * Get all Stripe price IDs for a subscription tier (both monthly and yearly)
 * @param tierId The subscription tier ID
 * @returns An object with monthly and yearly price IDs
 */
export async function getAllStripePriceIds(tierId: string): Promise<{ monthly: string | null; yearly: string | null }> {
  try {
    const supabase = createServerClient()

    // Get all mappings for this tier
    const { data: mappings, error } = await supabase
      .from("subscription_tiers_stripe_mapping")
      .select("stripe_price_id, billing_period")
      .eq("subscription_tier_id", tierId)
      .eq("is_active", true)

    if (error || !mappings) {
      console.error(`No active Stripe price mappings found for tier ${tierId}`)
      return { monthly: null, yearly: null }
    }

    // Extract the price IDs
    const monthlyMapping = mappings.find((m) => m.billing_period === "monthly")
    const yearlyMapping = mappings.find((m) => m.billing_period === "yearly")

    return {
      monthly: monthlyMapping?.stripe_price_id || null,
      yearly: yearlyMapping?.stripe_price_id || null,
    }
  } catch (error) {
    console.error("Error getting Stripe price IDs:", error)
    return { monthly: null, yearly: null }
  }
}
