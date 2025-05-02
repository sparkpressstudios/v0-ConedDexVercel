"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface EditSubscriptionTierModalProps {
  isOpen: boolean
  onClose: () => void
  tier: any
  onSuccess: () => void
}

export function EditSubscriptionTierModal({ isOpen, onClose, tier, onSuccess }: EditSubscriptionTierModalProps) {
  const [name, setName] = useState(tier.name)
  const [description, setDescription] = useState(tier.description || "")
  const [price, setPrice] = useState(tier.price.toString())
  const [billingPeriod, setBillingPeriod] = useState(tier.billing_period)
  const [isActive, setIsActive] = useState(tier.is_active)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validate inputs
      if (!name.trim()) {
        toast({
          title: "Validation Error",
          description: "Tier name is required",
          variant: "destructive",
        })
        return
      }

      const priceValue = Number.parseFloat(price)
      if (isNaN(priceValue) || priceValue < 0) {
        toast({
          title: "Validation Error",
          description: "Price must be a valid number greater than or equal to 0",
          variant: "destructive",
        })
        return
      }

      // Update the subscription tier
      const { error } = await supabase
        .from("subscription_tiers")
        .update({
          name,
          description: description || null,
          price: priceValue,
          billing_period: billingPeriod,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", tier.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Subscription tier updated successfully",
      })

      onSuccess()
      onClose()
    } catch (error) {
      console.error("Error updating subscription tier:", error)
      toast({
        title: "Error",
        description: "Failed to update subscription tier",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Tier</DialogTitle>
          <DialogDescription>
            Update the details for this subscription tier. Changes will affect new subscriptions immediately.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Tier Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Premium"
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this tier offers..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="billing-period">Billing Period</Label>
              <Select value={billingPeriod} onValueChange={setBillingPeriod}>
                <SelectTrigger id="billing-period">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch id="is-active" checked={isActive} onCheckedChange={setIsActive} />
            <Label htmlFor="is-active">Active</Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
