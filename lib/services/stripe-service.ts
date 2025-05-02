import Stripe from "stripe"
import { createServerClient } from "@/lib/supabase/server"

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2023-10-16", // Use the latest API version
})

export type StripeSubscriptionStatus =
  | "active"
  | "past_due"
  | "unpaid"
  | "canceled"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"

export interface StripeSubscriptionData {
  stripeCustomerId: string
  stripeSubscriptionId: string
  stripePriceId: string
  status: StripeSubscriptionStatus
  currentPeriodEnd: number
  cancelAtPeriodEnd: boolean
}

export class StripeService {
  /**
   * Create a Stripe checkout session for a subscription
   */
  static async createCheckoutSession(
    businessId: string,
    userId: string,
    tierId: string,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    try {
      // Get business and user details
      const supabase = createServerClient()

      const { data: business } = await supabase.from("shops").select("name, email").eq("id", businessId).single()

      const { data: user } = await supabase.from("users").select("email").eq("id", userId).single()

      if (!business || !user) {
        throw new Error("Business or user not found")
      }

      // Check if customer already exists
      const { data: existingCustomer } = await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("business_id", businessId)
        .single()

      let customerId = existingCustomer?.stripe_customer_id

      // Create a new customer if one doesn't exist
      if (!customerId) {
        const customer = await stripe.customers.create({
          email: user.email || business.email,
          name: business.name,
          metadata: {
            businessId,
            userId,
          },
        })

        customerId = customer.id

        // Save the customer ID
        await supabase.from("stripe_customers").insert({
          business_id: businessId,
          user_id: userId,
          stripe_customer_id: customerId,
        })
      }

      // Create the checkout session
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        success_url: `${successUrl}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl,
        metadata: {
          businessId,
          userId,
          tierId,
        },
        subscription_data: {
          metadata: {
            businessId,
            userId,
            tierId,
          },
        },
      })

      return { url: session.url, sessionId: session.id }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      throw error
    }
  }

  /**
   * Handle a webhook event from Stripe
   */
  static async handleWebhookEvent(signature: string, payload: string) {
    try {
      // Verify the webhook signature
      const event = stripe.webhooks.constructEvent(payload, signature, process.env.STRIPE_WEBHOOK_SECRET!)

      // Handle the event based on its type
      switch (event.type) {
        case "checkout.session.completed":
          await this.handleCheckoutSessionCompleted(event.data.object)
          break
        case "customer.subscription.created":
        case "customer.subscription.updated":
          await this.handleSubscriptionUpdated(event.data.object)
          break
        case "customer.subscription.deleted":
          await this.handleSubscriptionDeleted(event.data.object)
          break
        case "invoice.payment_succeeded":
          await this.handleInvoicePaymentSucceeded(event.data.object)
          break
        case "invoice.payment_failed":
          await this.handleInvoicePaymentFailed(event.data.object)
          break
        default:
          console.log(`Unhandled event type: ${event.type}`)
      }

      return { received: true }
    } catch (error) {
      console.error("Error handling webhook event:", error)
      throw error
    }
  }

  /**
   * Handle a checkout session completed event
   */
  private static async handleCheckoutSessionCompleted(session: any) {
    const supabase = createServerClient()

    // Get the metadata from the session
    const { businessId, userId, tierId } = session.metadata

    if (!businessId || !tierId) {
      console.error("Missing metadata in checkout session")
      return
    }

    // Update the business subscription in our database
    await supabase.rpc("update_business_subscription", {
      p_business_id: businessId,
      p_tier_id: tierId,
      p_user_id: userId,
      p_previous_tier_id: null,
      p_payment_provider: "stripe",
      p_payment_reference: session.subscription,
    })

    // Record the payment
    await supabase.from("subscription_payments").insert({
      business_id: businessId,
      user_id: userId,
      subscription_tier_id: tierId,
      payment_provider: "stripe",
      payment_reference: session.id,
      amount: session.amount_total / 100, // Convert from cents
      status: "completed",
      metadata: session,
    })
  }

  /**
   * Handle a subscription updated event
   */
  private static async handleSubscriptionUpdated(subscription: any) {
    const supabase = createServerClient()

    // Get the business ID from the metadata
    const { businessId } = subscription.metadata

    if (!businessId) {
      console.error("Missing businessId in subscription metadata")
      return
    }

    // Update the subscription status in our database
    await supabase
      .from("business_subscriptions")
      .update({
        status: subscription.status,
        end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        is_auto_renew: !subscription.cancel_at_period_end,
        payment_metadata: {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          stripe_status: subscription.status,
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: subscription.cancel_at_period_end,
        },
      })
      .eq("business_id", businessId)
      .eq("payment_reference", subscription.id)
  }

  /**
   * Handle a subscription deleted event
   */
  private static async handleSubscriptionDeleted(subscription: any) {
    const supabase = createServerClient()

    // Get the business ID from the metadata
    const { businessId } = subscription.metadata

    if (!businessId) {
      console.error("Missing businessId in subscription metadata")
      return
    }

    // Update the subscription status in our database
    await supabase
      .from("business_subscriptions")
      .update({
        status: "canceled",
        end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        is_auto_renew: false,
        payment_metadata: {
          stripe_subscription_id: subscription.id,
          stripe_customer_id: subscription.customer,
          stripe_status: "canceled",
          current_period_end: subscription.current_period_end,
          cancel_at_period_end: true,
        },
      })
      .eq("business_id", businessId)
      .eq("payment_reference", subscription.id)
  }

  /**
   * Handle an invoice payment succeeded event
   */
  private static async handleInvoicePaymentSucceeded(invoice: any) {
    const supabase = createServerClient()

    // Get the subscription ID
    const subscriptionId = invoice.subscription

    if (!subscriptionId) {
      console.error("Missing subscription ID in invoice")
      return
    }

    // Get the subscription to access its metadata
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const { businessId, userId, tierId } = subscription.metadata

    if (!businessId || !userId || !tierId) {
      console.error("Missing metadata in subscription")
      return
    }

    // Record the payment
    await supabase.from("subscription_payments").insert({
      business_id: businessId,
      user_id: userId,
      subscription_tier_id: tierId,
      payment_provider: "stripe",
      payment_reference: invoice.id,
      amount: invoice.amount_paid / 100, // Convert from cents
      status: "completed",
      metadata: invoice,
    })

    // Update the subscription status
    await supabase
      .from("business_subscriptions")
      .update({
        status: "active",
        end_date: new Date(subscription.current_period_end * 1000).toISOString(),
        payment_metadata: {
          ...subscription.metadata,
          last_payment_date: new Date().toISOString(),
          last_payment_amount: invoice.amount_paid / 100,
          last_payment_status: "succeeded",
        },
      })
      .eq("business_id", businessId)
      .eq("payment_reference", subscriptionId)
  }

  /**
   * Handle an invoice payment failed event
   */
  private static async handleInvoicePaymentFailed(invoice: any) {
    const supabase = createServerClient()

    // Get the subscription ID
    const subscriptionId = invoice.subscription

    if (!subscriptionId) {
      console.error("Missing subscription ID in invoice")
      return
    }

    // Get the subscription to access its metadata
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const { businessId, userId, tierId } = subscription.metadata

    if (!businessId || !userId || !tierId) {
      console.error("Missing metadata in subscription")
      return
    }

    // Record the failed payment
    await supabase.from("subscription_payments").insert({
      business_id: businessId,
      user_id: userId,
      subscription_tier_id: tierId,
      payment_provider: "stripe",
      payment_reference: invoice.id,
      amount: invoice.amount_due / 100, // Convert from cents
      status: "failed",
      metadata: invoice,
    })

    // Update the subscription status
    await supabase
      .from("business_subscriptions")
      .update({
        status: "past_due",
        payment_metadata: {
          ...subscription.metadata,
          last_payment_attempt: new Date().toISOString(),
          last_payment_status: "failed",
          failure_reason: invoice.failure_reason,
        },
      })
      .eq("business_id", businessId)
      .eq("payment_reference", subscriptionId)
  }

  /**
   * Get a customer's subscription data
   */
  static async getSubscriptionData(businessId: string): Promise<StripeSubscriptionData | null> {
    try {
      const supabase = createServerClient()

      // Get the customer ID
      const { data: customer } = await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("business_id", businessId)
        .single()

      if (!customer) {
        return null
      }

      // Get the subscription from Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customer.stripe_customer_id,
        limit: 1,
        status: "all",
      })

      if (subscriptions.data.length === 0) {
        return null
      }

      const subscription = subscriptions.data[0]

      return {
        stripeCustomerId: customer.stripe_customer_id,
        stripeSubscriptionId: subscription.id,
        stripePriceId: subscription.items.data[0].price.id,
        status: subscription.status as StripeSubscriptionStatus,
        currentPeriodEnd: subscription.current_period_end,
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
      }
    } catch (error) {
      console.error("Error getting subscription data:", error)
      return null
    }
  }

  /**
   * Cancel a subscription
   */
  static async cancelSubscription(businessId: string): Promise<boolean> {
    try {
      const subscriptionData = await this.getSubscriptionData(businessId)

      if (!subscriptionData) {
        return false
      }

      // Cancel the subscription at the end of the billing period
      await stripe.subscriptions.update(subscriptionData.stripeSubscriptionId, {
        cancel_at_period_end: true,
      })

      // Update our database
      const supabase = createServerClient()
      await supabase
        .from("business_subscriptions")
        .update({
          is_auto_renew: false,
          payment_metadata: {
            ...subscriptionData,
            cancel_at_period_end: true,
            canceled_at: Math.floor(Date.now() / 1000),
          },
        })
        .eq("business_id", businessId)
        .eq("payment_reference", subscriptionData.stripeSubscriptionId)

      return true
    } catch (error) {
      console.error("Error canceling subscription:", error)
      return false
    }
  }

  /**
   * Resume a canceled subscription
   */
  static async resumeSubscription(businessId: string): Promise<boolean> {
    try {
      const subscriptionData = await this.getSubscriptionData(businessId)

      if (!subscriptionData || !subscriptionData.cancelAtPeriodEnd) {
        return false
      }

      // Resume the subscription
      await stripe.subscriptions.update(subscriptionData.stripeSubscriptionId, {
        cancel_at_period_end: false,
      })

      // Update our database
      const supabase = createServerClient()
      await supabase
        .from("business_subscriptions")
        .update({
          is_auto_renew: true,
          payment_metadata: {
            ...subscriptionData,
            cancel_at_period_end: false,
            resumed_at: Math.floor(Date.now() / 1000),
          },
        })
        .eq("business_id", businessId)
        .eq("payment_reference", subscriptionData.stripeSubscriptionId)

      return true
    } catch (error) {
      console.error("Error resuming subscription:", error)
      return false
    }
  }

  /**
   * Create a customer portal session
   */
  static async createCustomerPortalSession(businessId: string, returnUrl: string) {
    try {
      const supabase = createServerClient()

      // Get the customer ID
      const { data: customer } = await supabase
        .from("stripe_customers")
        .select("stripe_customer_id")
        .eq("business_id", businessId)
        .single()

      if (!customer) {
        throw new Error("Customer not found")
      }

      // Create the portal session
      const session = await stripe.billingPortal.sessions.create({
        customer: customer.stripe_customer_id,
        return_url: returnUrl,
      })

      return { url: session.url }
    } catch (error) {
      console.error("Error creating customer portal session:", error)
      throw error
    }
  }

  /**
   * Get all available prices from Stripe
   */
  static async getStripePrices() {
    try {
      const prices = await stripe.prices.list({
        active: true,
        expand: ["data.product"],
        limit: 100,
      })

      return prices.data.map((price) => ({
        id: price.id,
        productId: typeof price.product === "string" ? price.product : price.product.id,
        productName: typeof price.product === "string" ? "" : price.product.name,
        unitAmount: price.unit_amount,
        currency: price.currency,
        recurring: price.recurring
          ? {
              interval: price.recurring.interval,
              intervalCount: price.recurring.interval_count,
            }
          : null,
        metadata: price.metadata,
      }))
    } catch (error) {
      console.error("Error getting Stripe prices:", error)
      throw error
    }
  }

  /**
   * Map subscription tiers to Stripe prices
   */
  static async mapTiersToStripePrices() {
    try {
      const supabase = createServerClient()

      // Get all subscription tiers
      const { data: tiers, error } = await supabase.from("subscription_tiers").select("*").eq("is_active", true)

      if (error) {
        throw error
      }

      // Get all Stripe prices
      const prices = await this.getStripePrices()

      // Map tiers to prices based on metadata
      const tierPriceMap = new Map()

      for (const tier of tiers) {
        // Find a matching price based on tier ID in metadata
        const matchingPrice = prices.find((price) => price.metadata && price.metadata.tier_id === tier.id)

        if (matchingPrice) {
          tierPriceMap.set(tier.id, matchingPrice)
        }
      }

      return tierPriceMap
    } catch (error) {
      console.error("Error mapping tiers to Stripe prices:", error)
      throw error
    }
  }
}
