import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import Stripe from "stripe"

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: roleError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (roleError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get request body
    const { mappingIds } = await request.json()

    if (!mappingIds || !Array.isArray(mappingIds) || mappingIds.length === 0) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    // Initialize Stripe
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: "2023-10-16",
    })

    // Get mappings to update
    const { data: mappings, error: mappingsError } = await supabase
      .from("stripe_product_mappings")
      .select("*")
      .in("id", mappingIds)

    if (mappingsError || !mappings) {
      return NextResponse.json({ error: "Failed to fetch product mappings" }, { status: 500 })
    }

    // Update each mapping
    const updateResults = await Promise.all(
      mappings.map(async (mapping) => {
        try {
          if (!mapping.stripe_price_id) {
            return { id: mapping.id, success: false, error: "No Stripe price ID" }
          }

          // Get Stripe price
          const stripePrice = await stripe.prices.retrieve(mapping.stripe_price_id)
          const stripePriceAmount = stripePrice.unit_amount! / 100

          // Update mapping with Stripe price
          const { error: updateError } = await supabase
            .from("stripe_product_mappings")
            .update({ price_amount: stripePriceAmount })
            .eq("id", mapping.id)

          if (updateError) {
            return { id: mapping.id, success: false, error: updateError.message }
          }

          // Log the update in audit log
          await supabase.from("admin_audit_log").insert({
            admin_id: user.id,
            action: "update_stripe_mapping",
            resource_type: "stripe_product_mapping",
            resource_id: mapping.id,
            details: {
              previous_price: mapping.price_amount,
              new_price: stripePriceAmount,
              stripe_price_id: mapping.stripe_price_id,
            },
          })

          return { id: mapping.id, success: true }
        } catch (error: any) {
          return { id: mapping.id, success: false, error: error.message }
        }
      }),
    )

    const successCount = updateResults.filter((r) => r.success).length
    const failureCount = updateResults.filter((r) => !r.success).length

    return NextResponse.json({
      success: true,
      message: `Updated ${successCount} prices successfully. ${failureCount} failed.`,
      results: updateResults,
    })
  } catch (error: any) {
    console.error("Error updating prices:", error)
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
  }
}
