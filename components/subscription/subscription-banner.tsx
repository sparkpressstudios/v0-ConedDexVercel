"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { Loader2, CreditCard } from "lucide-react"
import Link from "next/link"

interface SubscriptionBannerProps {
  businessId: string
}

export function SubscriptionBanner({ businessId }: SubscriptionBannerProps) {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchSubscription() {
      try {
        setIsLoading(true)
        const data = await SubscriptionService.getBusinessSubscription(businessId)
        setSubscription(data)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (businessId) {
      fetchSubscription()
    }
  }, [businessId])

  if (isLoading) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm">Loading subscription information...</span>
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="text-sm">No active subscription found.</span>
          </div>
          <Link href="/dashboard/shop/subscription">
            <Button size="sm" variant="outline">
              Subscribe Now
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  if (subscription.tier?.name === "Free") {
    return (
      <Card className="bg-muted/20">
        <CardContent className="p-4 flex items-center justify-between">
          <div className="flex items-center">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="text-sm">You're on the Free plan. Upgrade to unlock premium features.</span>
          </div>
          <Link href="/dashboard/shop/subscription">
            <Button size="sm">Upgrade</Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return null // Don't show banner for paid subscriptions
}
