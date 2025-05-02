"use client"

import { useState, useEffect } from "react"
import { Badge } from "@/components/ui/badge"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { Loader2 } from "lucide-react"

interface SubscriptionStatusProps {
  businessId: string
}

export function SubscriptionStatus({ businessId }: SubscriptionStatusProps) {
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
    return <Loader2 className="h-4 w-4 animate-spin" />
  }

  if (!subscription) {
    return <Badge variant="outline">No Subscription</Badge>
  }

  const getVariant = () => {
    switch (subscription.tier?.name) {
      case "Free":
        return "secondary"
      case "Standard":
        return "default"
      case "Premium":
        return "default"
      case "Enterprise":
        return "default"
      default:
        return "outline"
    }
  }

  return <Badge variant={getVariant()}>{subscription.tier?.name}</Badge>
}
