"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, ArrowRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { SubscriptionService } from "@/lib/services/subscription-service"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export function SubscriptionBanner() {
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [shopId, setShopId] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()

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

        setShopId(shop.id)

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

  if (isLoading || !shopId) return null

  // If the user has an active subscription, don't show the banner
  if (subscription && subscription.status === "active") return null

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 mb-6">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-medium text-blue-800">Upgrade your shop subscription</h3>
            <p className="text-sm text-blue-600 mt-1">
              Get access to premium features like advanced analytics, marketing tools, and more.
            </p>
          </div>
        </div>
        <Button
          onClick={() => router.push("/dashboard/shop/subscription")}
          className="bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          View Plans <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
