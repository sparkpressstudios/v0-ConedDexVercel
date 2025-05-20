"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Loader2, CreditCard, Calendar, CheckCircle, AlertCircle, Clock } from "lucide-react"

export function SubscriptionStatus() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    async function fetchSubscription() {
      if (!user) return

      try {
        setIsLoading(true)
        const supabase = createClient()

        // Get the shop ID for the current user
        const { data: shop } = await supabase.from("shops").select("id").eq("owner_id", user.id).single()

        if (!shop) {
          setIsLoading(false)
          return
        }

        // Get the subscription
        const subscription = await SubscriptionService.getBusinessSubscription(shop.id)
        setSubscription(subscription)
      } catch (error) {
        console.error("Error fetching subscription:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>Loading your subscription information...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  if (!subscription) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
          <CardDescription>You don't have an active subscription.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Subscribe to access premium features for your shop.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push("/dashboard/shop/subscription")}>View Plans</Button>
        </CardFooter>
      </Card>
    )
  }

  // Determine status color and icon
  const getStatusInfo = (status: string) => {
    switch (status) {
      case "active":
        return { color: "green", icon: <CheckCircle className="h-5 w-5 text-green-500" /> }
      case "past_due":
        return { color: "amber", icon: <AlertCircle className="h-5 w-5 text-amber-500" /> }
      case "canceled":
        return { color: "red", icon: <AlertCircle className="h-5 w-5 text-red-500" /> }
      case "trialing":
        return { color: "blue", icon: <Clock className="h-5 w-5 text-blue-500" /> }
      default:
        return { color: "gray", icon: <AlertCircle className="h-5 w-5 text-gray-500" /> }
    }
  }

  const statusInfo = getStatusInfo(subscription.status)

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Subscription Status</CardTitle>
            <CardDescription>Your current subscription details</CardDescription>
          </div>
          <Badge
            variant={statusInfo.color === "green" ? "outline" : "secondary"}
            className={`
              ${statusInfo.color === "green" ? "bg-green-50 text-green-700 border-green-200" : ""}
              ${statusInfo.color === "amber" ? "bg-amber-50 text-amber-700 border-amber-200" : ""}
              ${statusInfo.color === "red" ? "bg-red-50 text-red-700 border-red-200" : ""}
              ${statusInfo.color === "blue" ? "bg-blue-50 text-blue-700 border-blue-200" : ""}
            `}
          >
            <div className="flex items-center gap-1">
              {statusInfo.icon}
              <span className="capitalize">{subscription.status}</span>
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Plan:</span>
            <span className="font-medium">{subscription.tier?.name}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Price:</span>
            <span className="font-medium">
              ${subscription.tier?.price}/{subscription.tier?.billing_period}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Start Date:</span>
            <span className="font-medium">{new Date(subscription.start_date).toLocaleDateString()}</span>
          </div>
          {subscription.end_date && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">End Date:</span>
              <span className="font-medium">{new Date(subscription.end_date).toLocaleDateString()}</span>
            </div>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Auto Renew:</span>
            <span className="font-medium">{subscription.is_auto_renew ? "Yes" : "No"}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-3">
        <Button
          onClick={() => router.push("/dashboard/shop/subscription")}
          variant="default"
          className="w-full sm:w-auto"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Manage Subscription
        </Button>
        <Button
          onClick={() => router.push("/dashboard/shop/subscription")}
          variant="outline"
          className="w-full sm:w-auto"
        >
          <Calendar className="mr-2 h-4 w-4" />
          View Billing History
        </Button>
      </CardFooter>
    </Card>
  )
}
