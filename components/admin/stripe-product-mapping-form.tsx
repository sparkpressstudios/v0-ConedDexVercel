"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Plus, Trash, RefreshCw } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"

interface SubscriptionTier {
  id: string
  name: string
  price: number
  billing_period: string
  description?: string
  is_active: boolean
}

interface StripeMapping {
  id: string
  subscription_tier_id: string
  stripe_product_id: string
  stripe_price_id: string
  billing_period: string
  is_active: boolean
  price_amount?: number
  created_at: string
  updated_at: string
}

interface MappingFormState {
  subscription_tier_id: string
  stripe_product_id: string
  stripe_price_id: string
  billing_period: string
}

interface StripeProductMappingFormProps {
  tiers: SubscriptionTier[]
  existingMappings: StripeMapping[]
}

export function StripeProductMappingForm({ tiers, existingMappings: initialMappings }: StripeProductMappingFormProps) {
  const [mappings, setMappings] = useState<MappingFormState[]>([
    { subscription_tier_id: "", stripe_product_id: "", stripe_price_id: "", billing_period: "monthly" },
  ])
  const [existingMappings, setExistingMappings] = useState<StripeMapping[]>(initialMappings)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [activeTab, setActiveTab] = useState("add")
  const { toast } = useToast()
  const supabase = createClient()

  // Check for pricing changes
  useEffect(() => {
    const checkPricingChanges = async () => {
      if (tiers.length === 0 || existingMappings.length === 0) return

      const changedTiers = []

      for (const tier of tiers) {
        const mappingsForTier = existingMappings.filter((m) => m.subscription_tier_id === tier.id)

        for (const mapping of mappingsForTier) {
          // Find the tier that corresponds to this mapping
          const mappedTier = tiers.find((t) => t.id === mapping.subscription_tier_id)

          if (mappedTier) {
            // Check if the price in the tier matches what would be expected in Stripe
            // Stripe stores amounts in cents, so we multiply by 100
            const expectedStripeAmount = mappedTier.price * 100

            // We don't have direct access to the Stripe price amount here,
            // but we can notify the admin that they should check if prices match
            if (mapping.price_amount !== undefined && mappedTier.price !== mapping.price_amount) {
              changedTiers.push({
                tier: mappedTier,
                mapping,
              })
            }
          }
        }
      }

      if (changedTiers.length > 0) {
        toast({
          title: "Pricing changes detected",
          description: `${changedTiers.length} subscription tiers have price changes that may need to be synced with Stripe.`,
          variant: "warning",
          duration: 10000,
        })
      }
    }

    checkPricingChanges()
  }, [tiers, existingMappings, toast])

  const handleAddMapping = () => {
    setMappings([
      ...mappings,
      { subscription_tier_id: "", stripe_product_id: "", stripe_price_id: "", billing_period: "monthly" },
    ])
  }

  const handleRemoveMapping = (index: number) => {
    const newMappings = [...mappings]
    newMappings.splice(index, 1)
    setMappings(newMappings)
  }

  const handleChange = (index: number, field: keyof MappingFormState, value: string) => {
    const newMappings = [...mappings]
    newMappings[index][field] = value
    setMappings(newMappings)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSubmitting(true)

      // Validate form
      const invalidMapping = mappings.find(
        (m) => !m.subscription_tier_id || !m.stripe_product_id || !m.stripe_price_id || !m.billing_period,
      )

      if (invalidMapping) {
        toast({
          title: "Validation Error",
          description: "Please fill in all fields for each mapping.",
          variant: "destructive",
        })
        return
      }

      // Get current tier prices to store with mappings
      const tierPrices: Record<string, number> = {}
      for (const tier of tiers) {
        tierPrices[tier.id] = tier.price
      }

      // Insert mappings
      const { data, error } = await supabase.from("subscription_tiers_stripe_mapping").upsert(
        mappings.map((m) => ({
          subscription_tier_id: m.subscription_tier_id,
          stripe_product_id: m.stripe_product_id,
          stripe_price_id: m.stripe_price_id,
          billing_period: m.billing_period,
          is_active: true,
          price_amount: tierPrices[m.subscription_tier_id] || 0, // Store current price for change detection
        })),
        { onConflict: "subscription_tier_id,billing_period" },
      )

      if (error) throw error

      toast({
        title: "Success",
        description: "Stripe product mappings saved successfully.",
      })

      // Refresh the list of mappings
      const { data: refreshedMappings } = await supabase.from("subscription_tiers_stripe_mapping").select("*")
      setExistingMappings(refreshedMappings || [])

      // Reset form
      setMappings([{ subscription_tier_id: "", stripe_product_id: "", stripe_price_id: "", billing_period: "monthly" }])

      // Switch to view tab
      setActiveTab("view")
    } catch (error) {
      console.error("Error saving mappings:", error)
      toast({
        title: "Error",
        description: "Failed to save Stripe product mappings.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleActive = async (mapping: StripeMapping) => {
    try {
      const { error } = await supabase
        .from("subscription_tiers_stripe_mapping")
        .update({ is_active: !mapping.is_active })
        .eq("id", mapping.id)

      if (error) throw error

      // Refresh the list of mappings
      const { data: refreshedMappings } = await supabase.from("subscription_tiers_stripe_mapping").select("*")
      setExistingMappings(refreshedMappings || [])

      toast({
        title: "Success",
        description: `Mapping ${mapping.is_active ? "deactivated" : "activated"} successfully.`,
      })
    } catch (error) {
      console.error("Error toggling mapping:", error)
      toast({
        title: "Error",
        description: "Failed to update mapping status.",
        variant: "destructive",
      })
    }
  }

  const handleSyncWithStripe = async () => {
    try {
      setIsSyncing(true)

      // Call the API endpoint to sync products with Stripe
      const response = await fetch("/api/admin/stripe/sync-products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to sync with Stripe")
      }

      const result = await response.json()

      // Refresh the list of mappings
      const { data: refreshedMappings } = await supabase.from("subscription_tiers_stripe_mapping").select("*")
      setExistingMappings(refreshedMappings || [])

      toast({
        title: "Success",
        description: "Successfully synced with Stripe.",
      })
    } catch (error) {
      console.error("Error syncing with Stripe:", error)
      toast({
        title: "Error",
        description: "Failed to sync with Stripe.",
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="add">Add Mappings</TabsTrigger>
          <TabsTrigger value="view">View Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="add">
          <form onSubmit={handleSubmit} className="space-y-6">
            {mappings.map((mapping, index) => (
              <div key={index} className="p-4 border rounded-md bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Mapping #{index + 1}</h3>
                  {index > 0 && (
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveMapping(index)}>
                      <Trash className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`subscription_tier_id-${index}`}>Subscription Tier</Label>
                    <Select
                      id={`subscription_tier_id-${index}`}
                      value={mapping.subscription_tier_id}
                      onValueChange={(value) => handleChange(index, "subscription_tier_id", value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select tier" />
                      </SelectTrigger>
                      <SelectContent>
                        {tiers.map((tier) => (
                          <SelectItem key={tier.id} value={tier.id}>
                            {tier.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor={`stripe_product_id-${index}`}>Stripe Product ID</Label>
                    <Input
                      type="text"
                      id={`stripe_product_id-${index}`}
                      value={mapping.stripe_product_id}
                      onChange={(e) => handleChange(index, "stripe_product_id", e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label htmlFor={`stripe_price_id-${index}`}>Stripe Price ID</Label>
                    <Input
                      type="text"
                      id={`stripe_price_id-${index}`}
                      value={mapping.stripe_price_id}
                      onChange={(e) => handleChange(index, "stripe_price_id", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Billing Period</Label>
                    <RadioGroup
                      defaultValue={mapping.billing_period}
                      onValueChange={(value) => handleChange(index, "billing_period", value)}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="monthly" id={`monthly-${index}`} />
                        <Label htmlFor={`monthly-${index}`}>Monthly</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="yearly" id={`yearly-${index}`} />
                        <Label htmlFor={`yearly-${index}`}>Yearly</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            ))}

            <Button type="button" variant="outline" size="sm" onClick={handleAddMapping} className="mb-4">
              <Plus className="h-4 w-4 mr-1" />
              Add Mapping
            </Button>

            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Mappings
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="view">
          {existingMappings.length === 0 ? (
            <p>No mappings found.</p>
          ) : (
            <div className="grid gap-4">
              {existingMappings.map((mapping) => (
                <Card key={mapping.id}>
                  <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {tiers.find((tier) => tier.id === mapping.subscription_tier_id)?.name || "Unknown Tier"}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Product ID: {mapping.stripe_product_id} | Price ID: {mapping.stripe_price_id}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Billing Period: {mapping.billing_period} | Created:{" "}
                        {new Date(mapping.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={mapping.is_active ? "success" : "destructive"}>
                        {mapping.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button size="sm" onClick={() => handleToggleActive(mapping)}>
                        Toggle
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="secondary" disabled={isSyncing} onClick={handleSyncWithStripe}>
                {isSyncing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync with Stripe
              </Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
