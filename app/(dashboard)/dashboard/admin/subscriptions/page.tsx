"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, Plus, Edit, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { EditSubscriptionTierModal } from "@/components/admin/edit-subscription-tier-modal"
import { AddSubscriptionTierModal } from "@/components/admin/add-subscription-tier-modal"

export default function AdminSubscriptionsPage() {
  const [tiers, setTiers] = useState<any[]>([])
  const [features, setFeatures] = useState<any[]>([])
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  const [editingTier, setEditingTier] = useState<any>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Fetch subscription tiers
        const { data: tiersData, error: tiersError } = await supabase
          .from("subscription_tiers")
          .select("*")
          .order("price", { ascending: true })

        if (tiersError) throw tiersError
        setTiers(tiersData || [])

        // Fetch features
        const { data: featuresData, error: featuresError } = await supabase
          .from("feature_definitions")
          .select("*")
          .order("name", { ascending: true })

        if (featuresError) throw featuresError
        setFeatures(featuresData || [])

        // Fetch active subscriptions
        const { data: subscriptionsData, error: subscriptionsError } = await supabase
          .from("business_subscriptions")
          .select(`
            *,
            business:business_id(id, name),
            tier:subscription_tier_id(id, name)
          `)
          .order("created_at", { ascending: false })
          .limit(50)

        if (subscriptionsError) throw subscriptionsError
        setSubscriptions(subscriptionsData || [])
      } catch (error) {
        console.error("Error fetching subscription data:", error)
        toast({
          title: "Error",
          description: "Failed to load subscription data.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase, toast])

  const handleEditTier = (tier: any) => {
    setEditingTier(tier)
    setIsEditModalOpen(true)
  }

  const handleTierUpdated = async () => {
    // Refresh the tiers data
    const { data: tiersData, error: tiersError } = await supabase
      .from("subscription_tiers")
      .select("*")
      .order("price", { ascending: true })

    if (tiersError) {
      console.error("Error refreshing tiers:", tiersError)
      toast({
        title: "Error",
        description: "Failed to refresh subscription tiers.",
        variant: "destructive",
      })
      return
    }

    setTiers(tiersData || [])
  }

  const handleDeleteTier = async (tierId: string) => {
    if (!confirm("Are you sure you want to delete this subscription tier? This action cannot be undone.")) {
      return
    }

    try {
      // Check if any businesses are using this tier
      const { data: subscriptions, error: checkError } = await supabase
        .from("business_subscriptions")
        .select("id")
        .eq("subscription_tier_id", tierId)
        .limit(1)

      if (checkError) throw checkError

      if (subscriptions && subscriptions.length > 0) {
        toast({
          title: "Cannot Delete",
          description:
            "This tier is currently in use by one or more businesses. Please move them to another tier first.",
          variant: "destructive",
        })
        return
      }

      // Delete the tier
      const { error } = await supabase.from("subscription_tiers").delete().eq("id", tierId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Subscription tier deleted successfully",
      })

      // Refresh the tiers data
      handleTierUpdated()
    } catch (error) {
      console.error("Error deleting subscription tier:", error)
      toast({
        title: "Error",
        description: "Failed to delete subscription tier",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Subscription Management</h1>
        <p className="text-muted-foreground mt-2">Manage subscription tiers, features, and business subscriptions.</p>
      </div>

      <Tabs defaultValue="tiers">
        <TabsList>
          <TabsTrigger value="tiers">Subscription Tiers</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="subscriptions">Active Subscriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Subscription Tiers</h2>
            <Button onClick={() => setIsAddModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Tier
            </Button>
          </div>

          <div className="grid gap-4">
            {tiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{tier.name}</CardTitle>
                      <CardDescription>
                        {tier.price === 0 ? "Free" : `$${tier.price}/${tier.billing_period}`}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" onClick={() => handleEditTier(tier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={() => handleDeleteTier(tier.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Included Features</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {features.map((feature) => (
                        <div key={feature.id} className="flex items-center space-x-2">
                          <Checkbox id={`${tier.id}-${feature.id}`} />
                          <Label htmlFor={`${tier.id}-${feature.id}`} className="text-sm">
                            {feature.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Features</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Feature
            </Button>
          </div>

          <div className="grid gap-4">
            {features.map((feature) => (
              <Card key={feature.id}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{feature.name}</CardTitle>
                      <CardDescription>Key: {feature.key}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm">{feature.category || "Uncategorized"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Status:</span>
                      <span className="text-sm">{feature.is_active ? "Active" : "Inactive"}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="subscriptions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Active Subscriptions</h2>
          </div>

          <div className="grid gap-4">
            {subscriptions.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">No active subscriptions found.</p>
                </CardContent>
              </Card>
            ) : (
              subscriptions.map((subscription) => (
                <Card key={subscription.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{subscription.business?.name || "Unknown Business"}</CardTitle>
                        <CardDescription>
                          {subscription.tier?.name || "Unknown Tier"} - {subscription.status}
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Start Date:</span>
                        <span className="text-sm">{new Date(subscription.start_date).toLocaleDateString()}</span>
                      </div>
                      {subscription.end_date && (
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">End Date:</span>
                          <span className="text-sm">{new Date(subscription.end_date).toLocaleDateString()}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-sm font-medium">Auto Renew:</span>
                        <span className="text-sm">{subscription.is_auto_renew ? "Yes" : "No"}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      {editingTier && (
        <EditSubscriptionTierModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          tier={editingTier}
          onSuccess={handleTierUpdated}
        />
      )}
      <AddSubscriptionTierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleTierUpdated}
      />
    </div>
  )
}
