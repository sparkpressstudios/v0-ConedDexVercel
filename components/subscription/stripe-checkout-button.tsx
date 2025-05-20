"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Loader2, CreditCard } from "lucide-react"
import { createCheckoutSession } from "@/app/actions/stripe-actions"
import { useToast } from "@/hooks/use-toast"

interface StripeCheckoutButtonProps {
  businessId: string
  userId: string
  tierId: string
  priceId: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

export function StripeCheckoutButton({
  businessId,
  userId,
  tierId,
  priceId,
  variant = "default",
  size = "default",
  className,
  children,
  disabled = false,
}: StripeCheckoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    try {
      setIsLoading(true)

      if (!priceId) {
        toast({
          title: "Error",
          description: "Price ID is required",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const result = await createCheckoutSession(
        businessId,
        userId,
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
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={disabled || isLoading || !priceId}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        <>
          {children || (
            <>
              <CreditCard className="mr-2 h-4 w-4" />
              Subscribe
            </>
          )}
        </>
      )}
    </Button>
  )
}
