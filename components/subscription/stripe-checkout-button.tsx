"use client"

interface StripeCheckoutButtonProps {
  businessId: string
  userId: string
  tierId: string
  priceId: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default"
}
