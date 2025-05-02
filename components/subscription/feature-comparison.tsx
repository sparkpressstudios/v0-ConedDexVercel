"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Check, X, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface FeatureComparisonProps {
  currentTierId?: string
}

export function FeatureComparison({ currentTierId }: FeatureComparisonProps) {
  const [tiers, setTiers] = useState<any[]>([])
  const [features, setFeatures] = useState<any[]>([])
  const [tierFeatures, setTierFeatures] = useState<Record<string, string[]>>({})
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)

        // Get subscription tiers
        const { data: tiersData, error: tiersError } = await supabase
          .from("subscription_tiers")
          .select("*")
          .eq("is_active", true)
          .order("price", { ascending: true })

        if (tiersError) throw tiersError
        setTiers(tiersData || [])

        // Get features by category
        const { data: featuresData, error: featuresError } = await supabase
          .from("feature_definitions")
          .select("*")
          .eq("is_active", true)
          .order("category", { ascending: true })
          .order("name", { ascending: true })

        if (featuresError) throw featuresError
        setFeatures(featuresData || [])

        // Get tier-feature associations
        const { data: tierFeaturesData, error: tierFeaturesError } = await supabase
          .from("subscription_tier_features")
          .select("subscription_tier_id, feature_id")

        if (tierFeaturesError) throw tierFeaturesError

        // Create a map of tier ID to feature IDs
        const tierFeaturesMap: Record<string, string[]> = {}
        tierFeaturesData?.forEach((item) => {
          if (!tierFeaturesMap[item.subscription_tier_id]) {
            tierFeaturesMap[item.subscription_tier_id] = []
          }
          tierFeaturesMap[item.subscription_tier_id].push(item.feature_id)
        })

        setTierFeatures(tierFeaturesMap)
      } catch (error) {
        console.error("Error fetching subscription data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [supabase])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Group features by category
  const featuresByCategory = features.reduce(
    (acc, feature) => {
      const category = feature.category || "Other"
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(feature)
      return acc
    },
    {} as Record<string, any[]>,
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle>Feature Comparison</CardTitle>
        <CardDescription>Compare features across different subscription tiers</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[200px]">Feature</TableHead>
              {tiers.map((tier) => (
                <TableHead
                  key={tier.id}
                  className={currentTierId === tier.id ? "bg-primary/10 text-center" : "text-center"}
                >
                  {tier.name}
                  <div className="text-xs font-normal">
                    {tier.price === 0 ? "Free" : `$${tier.price}/${tier.billing_period}`}
                  </div>
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Object.entries(featuresByCategory).map(([category, categoryFeatures]) => (
              <>
                <TableRow key={category}>
                  <TableCell colSpan={tiers.length + 1} className="bg-muted/50 font-medium">
                    {category}
                  </TableCell>
                </TableRow>
                {categoryFeatures.map((feature) => (
                  <TableRow key={feature.id}>
                    <TableCell>{feature.name}</TableCell>
                    {tiers.map((tier) => (
                      <TableCell key={`${tier.id}-${feature.id}`} className="text-center">
                        {tierFeatures[tier.id]?.includes(feature.id) ? (
                          <Check className="mx-auto h-4 w-4 text-green-500" />
                        ) : (
                          <X className="mx-auto h-4 w-4 text-muted-foreground" />
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
