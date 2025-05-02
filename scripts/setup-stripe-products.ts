import Stripe from "stripe"
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

// Load environment variables
dotenv.config()

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16",
})

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

async function main() {
  try {
    console.log("Fetching subscription tiers from database...")

    // Get all subscription tiers from the database
    const { data: tiers, error } = await supabase.from("subscription_tiers").select("*").eq("is_active", true)

    if (error) {
      throw error
    }

    if (!tiers || tiers.length === 0) {
      console.log("No active subscription tiers found.")
      return
    }

    console.log(`Found ${tiers.length} active subscription tiers.`)

    // Process each tier
    for (const tier of tiers) {
      console.log(`Processing tier: ${tier.name}`)

      // Check if a product already exists for this tier
      const { data: existingMapping } = await supabase
        .from("subscription_tiers_stripe_mapping")
        .select("stripe_product_id")
        .eq("subscription_tier_id", tier.id)
        .maybeSingle()

      let productId = existingMapping?.stripe_product_id

      // If no product exists, create one in Stripe
      if (!productId) {
        console.log(`Creating Stripe product for tier: ${tier.name}`)

        const product = await stripe.products.create({
          name: tier.name,
          description: tier.description || `ConeDex ${tier.name} Subscription`,
          metadata: {
            tier_id: tier.id,
          },
        })

        productId = product.id
        console.log(`Created product with ID: ${productId}`)
      } else {
        console.log(`Product already exists with ID: ${productId}`)
      }

      // Create or update prices based on billing period
      if (tier.billing_period === "monthly") {
        // Create monthly price
        console.log(`Creating monthly price for tier: ${tier.name}`)

        const monthlyPrice = await stripe.prices.create({
          product: productId,
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

        console.log(`Created monthly price with ID: ${monthlyPrice.id}`)

        // Store the mapping in the database
        await supabase.from("subscription_tiers_stripe_mapping").upsert({
          subscription_tier_id: tier.id,
          stripe_product_id: productId,
          stripe_price_id: monthlyPrice.id,
          billing_period: "monthly",
          is_active: true,
        })
      } else if (tier.billing_period === "yearly") {
        // Create yearly price
        console.log(`Creating yearly price for tier: ${tier.name}`)

        const yearlyPrice = await stripe.prices.create({
          product: productId,
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

        console.log(`Created yearly price with ID: ${yearlyPrice.id}`)

        // Store the mapping in the database
        await supabase.from("subscription_tiers_stripe_mapping").upsert({
          subscription_tier_id: tier.id,
          stripe_product_id: productId,
          stripe_price_id: yearlyPrice.id,
          billing_period: "yearly",
          is_active: true,
        })
      }
    }

    console.log("Stripe product and price setup completed successfully!")
  } catch (error) {
    console.error("Error setting up Stripe products and prices:", error)
  }
}

main()
