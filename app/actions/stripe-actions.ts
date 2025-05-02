"use server"

import { StripeService } from "@/lib/services/stripe-service"
import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

/**
 * Create a checkout session for a subscription
 * This version handles both direct calls and form submissions
 */
export async function createCheckoutSession(
  formDataOrBusinessId: FormData | string,
  userId?: string,
  tierId?: string,
  priceId?: string,
  successUrl?: string,
  cancelUrl?: string,
) {
  try {
    // Check if this is a form submission or direct call
    if (formDataOrBusinessId instanceof FormData) {
      const formData = formDataOrBusinessId

      // Extract values from form data
      const priceId = formData.get("priceId") as string
      const tierId = formData.get("tierId") as string

      if (!priceId || !tierId) {
        return {
          error: "Missing price ID or tier ID",
          success: false,
        }
      }

      // Get the current user and business ID
      const supabase = createServerClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session?.user) {
        return {
          error: "User not authenticated",
          success: false,
        }
      }

      // Get the shop ID
      const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", session.user.id).single()

      if (!shop) {
        return {
          error: "Shop not found",
          success: false,
        }
      }

      // Create the checkout session
      const { url, sessionId } = await StripeService.createCheckoutSession(
        shop.id,
        session.user.id,
        tierId,
        priceId,
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shop/subscription/success`,
        `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/shop/subscription/cancel`,
      )

      if (url) {
        redirect(url)
      }

      return { success: true, url, sessionId }
    } else {
      // Direct call with parameters
      const businessId = formDataOrBusinessId

      // Validate inputs
      if (!businessId || !userId || !tierId || !priceId || !successUrl || !cancelUrl) {
        return {
          error: "Missing required parameters",
          success: false,
        }
      }

      // Create the checkout session
      const { url, sessionId } = await StripeService.createCheckoutSession(
        businessId,
        userId,
        tierId,
        priceId,
        successUrl,
        cancelUrl,
      )

      return {
        url,
        sessionId,
        success: true,
      }
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    return {
      error: "Failed to create checkout session",
      success: false,
    }
  }
}

/**
 * Handle a successful checkout
 */
export async function handleSuccessfulCheckout(sessionId: string, businessId: string) {
  try {
    // Validate inputs
    if (!sessionId || !businessId) {
      return {
        error: "Missing session ID or business ID",
        success: false,
      }
    }

    // Update the business subscription status
    const supabase = createServerClient()
    await supabase
      .from("business_subscriptions")
      .update({
        status: "active",
        payment_status: "paid",
      })
      .eq("business_id", businessId)
      .eq("payment_reference", sessionId)

    // Revalidate the subscription page
    revalidatePath("/dashboard/shop/subscription")

    return {
      success: true,
    }
  } catch (error) {
    console.error("Error handling successful checkout:", error)
    return {
      error: "Failed to process successful checkout",
      success: false,
    }
  }
}

/**
 * Cancel a subscription
 */
export async function cancelSubscription(businessId: string) {
  try {
    // Validate input
    if (!businessId) {
      return {
        error: "Missing business ID",
        success: false,
      }
    }

    // Cancel the subscription
    const success = await StripeService.cancelSubscription(businessId)

    if (success) {
      // Revalidate the subscription page
      revalidatePath("/dashboard/shop/subscription")

      return {
        success: true,
      }
    } else {
      return {
        error: "Failed to cancel subscription",
        success: false,
      }
    }
  } catch (error) {
    console.error("Error canceling subscription:", error)
    return {
      error: "Failed to cancel subscription",
      success: false,
    }
  }
}

/**
 * Resume a canceled subscription
 */
export async function resumeSubscription(businessId: string) {
  try {
    // Validate input
    if (!businessId) {
      return {
        error: "Missing business ID",
        success: false,
      }
    }

    // Resume the subscription
    const success = await StripeService.resumeSubscription(businessId)

    if (success) {
      // Revalidate the subscription page
      revalidatePath("/dashboard/shop/subscription")

      return {
        success: true,
      }
    } else {
      return {
        error: "Failed to resume subscription",
        success: false,
      }
    }
  } catch (error) {
    console.error("Error resuming subscription:", error)
    return {
      error: "Failed to resume subscription",
      success: false,
    }
  }
}

/**
 * Create a customer portal session
 */
export async function createBillingPortalSession(businessId: string, returnUrl: string) {
  try {
    // Validate inputs
    if (!businessId || !returnUrl) {
      return {
        error: "Missing required parameters",
        success: false,
      }
    }

    // Create the portal session
    const { url } = await StripeService.createCustomerPortalSession(businessId, returnUrl)

    return {
      url,
      success: true,
    }
  } catch (error) {
    console.error("Error creating customer portal session:", error)
    return {
      error: "Failed to create customer portal session",
      success: false,
    }
  }
}
