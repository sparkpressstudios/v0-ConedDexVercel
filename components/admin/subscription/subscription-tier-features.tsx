"use client"

import { useState, useEffect } from "react"
import { Loader2, Save, Check, X, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { getSubscriptionTierWithFeatures, updateTierFeatures } from "@/app/actions/admin/subscription-feature-actions"

interface Feature {
  id: string
  name: string
  key: string
  description: string | null
  category: string | null
  isEnabled: boolean
  limit: number | null
  limitId: string | null
}

interface SubscriptionTier {
  id: string
  name: string
  description: string | null
  price: number | null
  stripe_price_id: string | null
  is_active: boolean
}

export function SubscriptionTierFeatures({ tierId }: { tierId: string }) {
  const [tier, setTier] = useState<SubscriptionTier | null>(null)
  const [features, setFeatures] = useState<Feature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  const { toast } = useToast()

  // Load tier and features on mount
  useEffect(() => {
    loadTierFeatures()
  }, [tierId])

  const loadTierFeatures = async () => {
    setIsLoading(true)

    try {
      const { tier, features, success, error } = await getSubscriptionTierWithFeatures(tierId)

      if (success && tier && features) {
        setTier(tier)
        setFeatures(features)
      } else {
        toast({
          title: "Error loading subscription tier",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading subscription tier:", error)
      toast({
        title: "Error loading subscription tier",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleFeatureToggle = (id: string, enabled: boolean) => {
    setFeatures((prev) => prev.map((feature) => (feature.id === id ? { ...feature, isEnabled: enabled } : feature)))
    setHasChanges(true)
  }

  const handleLimitChange = (id: string, value: string) => {
    const limit = value === "" ? null : Number.parseInt(value)

    setFeatures((prev) => prev.map((feature) => (feature.id === id ? { ...feature, limit } : feature)))
    setHasChanges(true)
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Format the features for the API
      const featureUpdates = features.map((feature) => ({
        featureId: feature.id,
        isEnabled: feature.isEnabled,
        limit: feature.limit,
      }))

      const { success, error } = await updateTierFeatures({
        tierId,
        features: featureUpdates,
      })

      if (success) {
        toast({
          title: "Features updated",
          description: `Features for ${tier?.name} have been updated successfully.`,
        })
        setHasChanges(false)
        loadTierFeatures() // Reload to get the latest state
      } else {
        toast({
          title: "Error updating features",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving features:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Group features by category
  const featuresByCategory: Record<string, Feature[]> = {}
  features.forEach((feature) => {
    const category = feature.category || "Uncategorized"
    if (!featuresByCategory[category]) {
      featuresByCategory[category] = []
    }
    featuresByCategory[category].push(feature)
  })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-64" />
        </div>

        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <div className="border rounded-md divide-y">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="p-4 flex items-center justify-between">
                  <div className="space-y-2 w-full">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">{tier?.name} Features</h3>
          <p className="text-sm text-muted-foreground">Enable or disable features for this subscription tier</p>
        </div>

        <Button onClick={handleSave} disabled={!hasChanges || isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save Changes
        </Button>
      </div>

      {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
        <div key={category} className="space-y-2">
          <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
          <div className="border rounded-md divide-y">
            {categoryFeatures.map((feature) => (
              <div key={feature.id} className="p-4 grid grid-cols-[1fr_auto_auto] gap-4 items-center">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h5 className="font-medium">{feature.name}</h5>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <Info className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="max-w-xs">{feature.description || "No description provided"}</p>
                          <p className="text-xs font-mono mt-1">Key: {feature.key}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description || "No description provided"}</p>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-sm">Limit:</label>
                  <Input
                    type="number"
                    min="0"
                    className="w-20"
                    value={feature.limit === null ? "" : feature.limit}
                    onChange={(e) => handleLimitChange(feature.id, e.target.value)}
                    placeholder="None"
                    disabled={!feature.isEnabled}
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={feature.isEnabled}
                    onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                  />
                  <span className="text-sm">
                    {feature.isEnabled ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                        <Check className="mr-1 h-3 w-3" />
                        Enabled
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-500 hover:bg-gray-50">
                        <X className="mr-1 h-3 w-3" />
                        Disabled
                      </Badge>
                    )}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {features.length === 0 && (
        <div className="text-center py-8 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">No features available to assign to this tier.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => (window.location.href = "/dashboard/admin/subscriptions/features?tab=features")}
          >
            Create Features First
          </Button>
        </div>
      )}

      {hasChanges && (
        <div className="flex justify-end mt-4">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Changes
          </Button>
        </div>
      )}
    </div>
  )
}
