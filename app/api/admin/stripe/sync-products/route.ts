import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import Stripe from "stripe"

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

export async function POST() {
  try {
    const supabase = createServerClient()

    // Get all subscription tiers from the database
    const { data: tiers, error } = await supabase.from("subscription_tiers").select("*").eq("is_active", true)

    if (error) {
      throw error
    }

    if (!tiers || tiers.length === 0) {
      return NextResponse.json({ message: "No active subscription tiers found." })
    }

    // Get all Stripe products
    const products = await stripe.products.list({ limit: 100, active: true })

    // Get all Stripe prices
    const prices = await stripe.prices.list({ limit: 100, active: true })

    const results = []

    // Process each tier
    for (const tier of tiers) {
      // Check if a product already exists for this tier
      let product = products.data.find((p) => p.metadata.tier_id === tier.id)

      // If no product exists, create one in Stripe
      if (!product) {
        product = await stripe.products.create({
          name: tier.name,
          description: tier.description || `ConeDex ${tier.name} Subscription`,
          metadata: {
            tier_id: tier.id,
          },
        })

        results.push({ tier: tier.name, action: "created_product", product_id: product.id })
      }

      // Create or update prices based on billing period
      if (tier.billing_period === "monthly") {
        // Check if a monthly price already exists
        let monthlyPrice = prices.data.find(
          (p) => p.product === product.id && p.recurring?.interval === "month" && p.metadata.tier_id === tier.id,
        )

        // If no monthly price exists, create one
        if (!monthlyPrice) {
          monthlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(tier.price * 100), // Convert to cents
            currency: "usd",
            recurring: {
              interval: "month",
            },
            metadata: {
              tier_id: tier.id,
              billing_period: "monthly",
            },
          })

          results.push({ tier: tier.name, action: "created_monthly_price", price_id: monthlyPrice.id })
        }

        // Store the mapping in the database
        await supabase.from("subscription_tiers_stripe_mapping").upsert(
          {
            subscription_tier_id: tier.id,
            stripe_product_id: product.id,
            stripe_price_id: monthlyPrice.id,
            billing_period: "monthly",
            is_active: true,
          },
          { onConflict: "subscription_tier_id,stripe_price_id,billing_period" },
        )

        results.push({ tier: tier.name, action: "updated_mapping", billing_period: "monthly" })
      } else if (tier.billing_period === "yearly") {
        // Check if a yearly price already exists
        let yearlyPrice = prices.data.find(
          (p) => p.product === product.id && p.recurring?.interval === "year" && p.metadata.tier_id === tier.id,
        )

        // If no yearly price exists, create one
        if (!yearlyPrice) {
          yearlyPrice = await stripe.prices.create({
            product: product.id,
            unit_amount: Math.round(tier.price * 100), // Convert to cents
            currency: "usd",
            recurring: {
              interval: "year",
            },
            metadata: {
              tier_id: tier.id,
              billing_period: "yearly",
            },
          })

          results.push({ tier: tier.name, action: "created_yearly_price", price_id: yearlyPrice.id })
        }

        // Store the mapping in the database
        await supabase.from("subscription_tiers_stripe_mapping").upsert(
          {
            subscription_tier_id: tier.id,
            stripe_product_id: product.id,
            stripe_price_id: yearlyPrice.id,
            billing_period: "yearly",
            is_active: true,
          },
          { onConflict: "subscription_tier_id,stripe_price_id,billing_period" },
        )

        results.push({ tier: tier.name, action: "updated_mapping", billing_period: "yearly" })
      }
    }

    return NextResponse.json({
      success: true,
      message: "Stripe products and prices synced successfully",
      results,
    })
  } catch (error) {
    console.error("Error syncing Stripe products:", error)
    return NextResponse.json({ error: "Failed to sync Stripe products" }, { status: 500 })
  }
}
