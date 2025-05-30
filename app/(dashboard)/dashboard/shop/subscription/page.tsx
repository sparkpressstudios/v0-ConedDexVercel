"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Check, AlertCircle, CreditCard } from "lucide-react"
import { SubscriptionService, type SubscriptionTier, type FeatureDefinition } from "@/lib/services/subscription-service"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { FeatureComparison } from "@/components/subscription/feature-comparison"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { createCheckoutSession, createBillingPortalSession } from "@/app/actions/stripe-actions"
import { createClient } from "@/lib/supabase/client"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SubscriptionPage() {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<any>(null)
  const [tierFeatures, setTierFeatures] = useState<Record<string, FeatureDefinition[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [stripePrices, setStripePrices] = useState<Record<string, { monthly: string; yearly: string }>>({})
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly")
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const { user } = useAuth()
  const [shopId, setShopId] = useState<string | null>(null)

  // Check for success or canceled status from Stripe
  const success = searchParams.get("success")
  const canceled = searchParams.get("canceled")
  const sessionId = searchParams.get("session_id")

  useEffect(() => {
    if (success && sessionId) {
      toast({
        title: "Subscription successful!",
        description: "Your subscription has been processed successfully.",
      })

      // Clear the URL parameters after showing the toast
      const url = new URL(window.location.href)
      url.searchParams.delete("success")
      url.searchParams.delete("session_id")
      router.replace(url.pathname)
    } else if (canceled) {
      toast({
        title: "Subscription canceled",
        description: "Your subscription process was canceled.",
        variant: "destructive",
      })

      // Clear the URL parameters after showing the toast
      const url = new URL(window.location.href)
      url.searchParams.delete("canceled")
      router.replace(url.pathname)
    }
  }, [success, canceled, sessionId, toast, router])

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Get the shop ID for the current user
        const supabase = createClient()
        const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user?.id).single()

        if (!shop) {
          toast({
            title: "Shop not found",
            description: "You need to create a shop before managing subscriptions.",
            variant: "destructive",
          })
          router.push("/dashboard/shop/claim")
          return
        }

        setShopId(shop.id)

        // Get subscription tiers
        const subscriptionTiers = await SubscriptionService.getSubscriptionTiers()
        setTiers(subscriptionTiers)

        // Get current subscription
        const subscription = await SubscriptionService.getBusinessSubscription(shop.id)
        setCurrentSubscription(subscription)

        // Get features for each tier
        const featuresMap: Record<string, FeatureDefinition[]> = {}
        for (const tier of subscriptionTiers) {
          const features = await SubscriptionService.getTierFeatures(tier.id)
          featuresMap[tier.id] = features
        }
        setTierFeatures(featuresMap)

        // Get Stripe price mappings
        const { data: priceMappings } = await supabase
          .from("subscription_tiers_stripe_mapping")
          .select("subscription_tier_id, stripe_price_id, billing_period")
          .eq("is_active", true)

        if (priceMappings) {
          const priceMap: Record<string, { monthly: string; yearly: string }> = {}

          // Initialize all tiers with empty values
          subscriptionTiers.forEach((tier) => {
            priceMap[tier.id] = { monthly: "", yearly: "" }
          })

          // Fill in the values we have
          priceMappings.forEach((mapping) => {
            if (!priceMap[mapping.subscription_tier_id]) {
              priceMap[mapping.subscription_tier_id] = { monthly: "", yearly: "" }
            }

            if (mapping.billing_period === "monthly") {
              priceMap[mapping.subscription_tier_id].monthly = mapping.stripe_price_id
            } else if (mapping.billing_period === "yearly") {
              priceMap[mapping.subscription_tier_id].yearly = mapping.stripe_price_id
            }
          })

          setStripePrices(priceMap)
        }
      } catch (error) {
        console.error("Error fetching subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription information.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      fetchData()
    }
  }, [user, router, toast])

  const handleManageSubscription = async () => {
    try {
      setIsUpdating(true)

      if (!shopId) {
        toast({
          title: "Error",
          description: "Shop ID not found.",
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }

      const result = await createBillingPortalSession(shopId, `${window.location.origin}/dashboard/shop/subscription`)

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        throw new Error(result.error || "Failed to create billing portal session")
      }
    } catch (error) {
      console.error("Error managing subscription:", error)
      toast({
        title: "Error",
        description: "Failed to open billing portal.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  const handleSubscribe = async (tierId: string) => {
    try {
      setIsUpdating(true)

      if (!shopId || !user?.id) {
        toast({
          title: "Error",
          description: "Shop or user information not found.",
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }

      const priceId = billingPeriod === "monthly" ? stripePrices[tierId]?.monthly : stripePrices[tierId]?.yearly

      if (!priceId) {
        toast({
          title: "Error",
          description: `No ${billingPeriod} price available for this tier.`,
          variant: "destructive",
        })
        setIsUpdating(false)
        return
      }

      const result = await createCheckoutSession(
        shopId,
        user.id,
        tierId,
        priceId,
        `${window.location.origin}/dashboard/shop/subscription?success=true`,
        `${window.location.origin}/dashboard/shop/subscription?canceled=true`,
      )

      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        throw new Error(result.error || "Failed to create checkout session")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      toast({
        title: "Error",
        description: "Failed to start checkout process.",
        variant: "destructive",
      })
      setIsUpdating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Group features by category for better display
  const getFeaturesByCategory = (features: FeatureDefinition[]) => {
    return features.reduce(
      (acc, feature) => {
        const category = feature.category || "Other"
        if (!acc[category]) {
          acc[category] = []
        }
        acc[category].push(feature)
        return acc
      },
      {} as Record<string, FeatureDefinition[]>,
    )
  }

  // Calculate savings for yearly billing
  const calculateYearlySavings = (tier: SubscriptionTier) => {
    if (tier.price === 0) return null
    const monthlyCost = tier.price * 12
    const yearlyCost = tier.price * 10 // Assuming 2 months free for yearly
    const savings = monthlyCost - yearlyCost
    const savingsPercentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage: savingsPercentage }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">Manage your shop's subscription and access to premium features.</p>
      </div>

      {success && (
        <Alert className="bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" />
          <AlertTitle>Subscription Successful</AlertTitle>
          <AlertDescription>
            Your subscription has been processed successfully. It may take a few moments to reflect in your account.
          </AlertDescription>
        </Alert>
      )}

      {canceled && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Subscription Canceled</AlertTitle>
          <AlertDescription>Your subscription process was canceled. No charges have been made.</AlertDescription>
        </Alert>
      )}

      {currentSubscription && (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Your shop is currently on the {currentSubscription.tier?.name} plan.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              <div className="flex justify-between">
                <span>Status:</span>
                <span className="font-medium capitalize">{currentSubscription.status}</span>
              </div>
              <div className="flex justify-between">
                <span>Start Date:</span>
                <span className="font-medium">{new Date(currentSubscription.start_date).toLocaleDateString()}</span>
              </div>
              {currentSubscription.current_period_end && (
                <div className="flex justify-between">
                  <span>Current Period Ends:</span>
                  <span className="font-medium">
                    {new Date(currentSubscription.current_period_end).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Auto Renew:</span>
                <span className="font-medium">{currentSubscription.is_auto_renew ? "Yes" : "No"}</span>
              </div>
              {currentSubscription.payment_reference && (
                <div className="mt-4">
                  <Button onClick={handleManageSubscription} variant="outline" className="w-full" disabled={isUpdating}>
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Manage Billing
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end mb-4">
        <Tabs value={billingPeriod} onValueChange={(v) => setBillingPeriod(v as "monthly" | "yearly")}>
          <TabsList>
            <TabsTrigger value="monthly" className="flex items-center gap-1">
              Monthly
            </TabsTrigger>
            <TabsTrigger value="yearly" className="flex items-center gap-1">
              Yearly <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">Save 16%</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tiers.map((tier) => {
          const isCurrentTier = currentSubscription?.subscription_tier_id === tier.id
          const features = tierFeatures[tier.id] || []
          const featuresByCategory = getFeaturesByCategory(features)
          const stripePrice =
            billingPeriod === "monthly" ? stripePrices[tier.id]?.monthly : stripePrices[tier.id]?.yearly
          const savings = billingPeriod === "yearly" ? calculateYearlySavings(tier) : null

          return (
            <Card key={tier.id} className={isCurrentTier ? "border-primary shadow-md" : ""}>
              <CardHeader>
                <CardTitle>{tier.name}</CardTitle>
                <CardDescription className="flex flex-col">
                  <span className="text-lg font-semibold">
                    {tier.price === 0
                      ? "Free"
                      : `$${billingPeriod === "yearly" ? tier.price * 10 : tier.price}/${billingPeriod === "yearly" ? "year" : "month"}`}
                  </span>
                  {billingPeriod === "yearly" && tier.price > 0 && (
                    <span className="text-xs text-green-600 mt-1">Save ${savings?.amount} per year</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(featuresByCategory).map(([category, features]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="font-medium text-sm">{category}</h4>
                    <ul className="space-y-1">
                      {features.map((feature) => (
                        <li key={feature.id} className="flex items-start gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 shrink-0" />
                          <span>{feature.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </CardContent>
              <CardFooter>
                {tier.price === 0 ? (
                  <Button
                    className="w-full"
                    variant={isCurrentTier ? "outline" : "default"}
                    disabled={isCurrentTier || isUpdating}
                    onClick={() => {
                      // For free tier, use the old method
                      // This is a placeholder - you should implement this
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : isCurrentTier ? (
                      "Current Plan"
                    ) : (
                      `Switch to ${tier.name}`
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleSubscribe(tier.id)}
                    className="w-full"
                    variant={isCurrentTier ? "outline" : "default"}
                    disabled={isCurrentTier || isUpdating || !stripePrice}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : isCurrentTier ? (
                      "Current Plan"
                    ) : !stripePrice ? (
                      "Price Not Available"
                    ) : (
                      `Subscribe to ${tier.name}`
                    )}
                  </Button>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <FeatureComparison currentTierId={currentSubscription?.subscription_tier_id} />
    </div>
  )
}
