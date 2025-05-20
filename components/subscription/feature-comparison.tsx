"use client"

import React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Check, Minus, HelpCircle } from "lucide-react"
import { SubscriptionService, type SubscriptionTier, type FeatureDefinition } from "@/lib/services/subscription-service"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface FeatureComparisonProps {
  currentTierId?: string
}

export function FeatureComparison({ currentTierId }: FeatureComparisonProps) {
  const [tiers, setTiers] = useState<SubscriptionTier[]>([])
  const [features, setFeatures] = useState<Record<string, FeatureDefinition[]>>({})
  const [categories, setCategories] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<string>("all")

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Get all subscription tiers
        const subscriptionTiers = await SubscriptionService.getSubscriptionTiers()
        setTiers(subscriptionTiers)

        // Get features for each tier
        const featuresMap: Record<string, FeatureDefinition[]> = {}
        const allCategories = new Set<string>()

        for (const tier of subscriptionTiers) {
          const tierFeatures = await SubscriptionService.getTierFeatures(tier.id)
          featuresMap[tier.id] = tierFeatures

          // Collect all unique categories
          tierFeatures.forEach((feature) => {
            if (feature.category) {
              allCategories.add(feature.category)
            } else {
              allCategories.add("Other")
            }
          })
        }

        setFeatures(featuresMap)
        setCategories(Array.from(allCategories))
      } catch (error) {
        console.error("Error fetching subscription data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
          <CardDescription>Loading feature comparison...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Get all unique features across all tiers
  const allFeatures = new Map<string, FeatureDefinition>()
  Object.values(features).forEach((tierFeatures) => {
    tierFeatures.forEach((feature) => {
      allFeatures.set(feature.key, feature)
    })
  })

  // Group features by category
  const featuresByCategory: Record<string, FeatureDefinition[]> = {}
  allFeatures.forEach((feature) => {
    const category = feature.category || "Other"
    if (!featuresByCategory[category]) {
      featuresByCategory[category] = []
    }
    featuresByCategory[category].push(feature)
  })

  // Check if a tier has a specific feature
  const tierHasFeature = (tierId: string, featureKey: string) => {
    return features[tierId]?.some((f) => f.key === featureKey) || false
  }

  // Filter features by selected category
  const filteredCategories = activeTab === "all" ? categories : [activeTab]

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
        <CardDescription>Compare features across different subscription tiers</CardDescription>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 mb-4">
            <TabsTrigger value="all">All Features</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category}>
                {category}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-4 font-medium">Feature</th>
                {tiers.map((tier) => (
                  <th
                    key={tier.id}
                    className={`text-center py-2 px-4 font-medium ${currentTierId === tier.id ? "bg-primary/10" : ""}`}
                  >
                    {tier.name}
                    {currentTierId === tier.id && <span className="block text-xs">(Current)</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <React.Fragment key={category}>
                  <tr className="bg-muted/50">
                    <td colSpan={tiers.length + 1} className="py-2 px-4 font-medium">
                      {category}
                    </td>
                  </tr>
                  {featuresByCategory[category]?.map((feature) => (
                    <tr key={feature.key} className="border-b border-muted">
                      <td className="py-2 px-4 flex items-center gap-2">
                        {feature.name}
                        {feature.description && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{feature.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </td>
                      {tiers.map((tier) => (
                        <td
                          key={tier.id}
                          className={`text-center py-2 px-4 ${currentTierId === tier.id ? "bg-primary/10" : ""}`}
                        >
                          {tierHasFeature(tier.id, feature.key) ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <Minus className="h-5 w-5 text-muted-foreground mx-auto" />
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
