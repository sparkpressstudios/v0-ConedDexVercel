import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"
import { handleApiError, logErrorToAudit } from "@/lib/utils/handle-api-error"

// Maximum number of retry attempts for Stripe API calls
const MAX_RETRIES = 3
// Delay between retries (in milliseconds)
const RETRY_DELAY = 1000

/**
 * Helper function to retry Stripe API calls
 */
async function retryStripeOperation<T>(operation: () => Promise<T>, retries = MAX_RETRIES): Promise<T> {
  try {
    return await operation()
  } catch (error: any) {
    // Only retry on rate limiting or network errors
    if (
      retries > 0 &&
      (error.type === "StripeRateLimitError" ||
        error.type === "StripeConnectionError" ||
        error.code === "ECONNRESET" ||
        error.code === "ETIMEDOUT")
    ) {
      console.log(`Retrying Stripe operation. Attempts remaining: ${retries - 1}`)
      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY))
      return retryStripeOperation(operation, retries - 1)
    }
    throw error
  }
}

export async function GET() {
  try {
    const supabase = createClient()

    // Verify admin access
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (userError || !userData || userData.role !== "admin") {
      await logErrorToAudit(
        { status: 403, message: "Forbidden - Non-admin access attempt" },
        "stripe-price-sync-check",
        session.user.id,
      )
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })

    // Get all product mappings
    const { data: mappings, error: mappingsError } = await supabase.from("stripe_product_mappings").select("*")

    if (mappingsError) {
      throw mappingsError
    }

    // Check for price discrepancies
    const results = await Promise.all(
      mappings.map(async (mapping) => {
        try {
          // Get Stripe price
          const stripePrice = await retryStripeOperation(async () => {
            return await stripe.prices.retrieve(mapping.stripe_price_id)
          })

          const stripePriceAmount = stripePrice.unit_amount || 0
          const conedexPriceAmount = mapping.price_amount || 0

          // Check if prices match
          const pricesMatch = stripePriceAmount === conedexPriceAmount

          return {
            id: mapping.id,
            conedex_product_id: mapping.conedex_product_id,
            stripe_product_id: mapping.stripe_product_id,
            stripe_price_id: mapping.stripe_price_id,
            conedex_price: conedexPriceAmount,
            stripe_price: stripePriceAmount,
            status: pricesMatch ? "synced" : "out_of_sync",
            difference: pricesMatch ? 0 : stripePriceAmount - conedexPriceAmount,
          }
        } catch (error) {
          console.error(`Error checking price for mapping ${mapping.id}:`, error)

          // Log the specific error
          await logErrorToAudit(error, `stripe-price-sync-check-mapping-${mapping.id}`, session.user.id)

          return {
            id: mapping.id,
            conedex_product_id: mapping.conedex_product_id,
            stripe_product_id: mapping.stripe_product_id,
            stripe_price_id: mapping.stripe_price_id,
            conedex_price: mapping.price_amount || 0,
            stripe_price: null,
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    // Calculate summary statistics
    const syncedCount = results.filter((r) => r.status === "synced").length
    const outOfSyncCount = results.filter((r) => r.status === "out_of_sync").length
    const errorCount = results.filter((r) => r.status === "error").length

    // Log the check to audit log
    await supabase.from("admin_audit_logs").insert({
      action: "PRICE_SYNC_CHECK",
      resource_type: "stripe_product_mappings",
      details: {
        total: results.length,
        synced: syncedCount,
        out_of_sync: outOfSyncCount,
        errors: errorCount,
        timestamp: new Date().toISOString(),
      },
      user_id: session.user.id,
    })

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
        synced: syncedCount,
        out_of_sync: outOfSyncCount,
        errors: errorCount,
      },
    })
  } catch (error) {
    const apiError = handleApiError(error, "Failed to check price synchronization")

    // Log the error
    await logErrorToAudit(apiError, "stripe-price-sync-check", "system")

    return NextResponse.json({ error: apiError.message, details: apiError.details }, { status: apiError.status })
  }
}
