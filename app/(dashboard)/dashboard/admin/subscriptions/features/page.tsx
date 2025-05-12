import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getSubscriptionTiers } from "@/app/actions/admin/subscription-feature-actions"
import { FeatureManagement } from "@/components/admin/subscription/feature-management"
import { SubscriptionTierFeatures } from "@/components/admin/subscription/subscription-tier-features"

export const dynamic = "force-dynamic"

export default async function SubscriptionFeaturesPage() {
  const { tiers, success, error } = await getSubscriptionTiers()

  if (!success) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/admin/subscriptions">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Subscription Features</h1>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-red-500 mb-2">Error loading subscription tiers</p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/subscriptions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Subscription Features</h1>
      </div>

      <p className="text-muted-foreground">Manage features and assign them to subscription tiers</p>

      <Tabs defaultValue="features">
        <TabsList>
          <TabsTrigger value="features">Feature Management</TabsTrigger>
          {tiers?.map((tier) => (
            <TabsTrigger key={tier.id} value={tier.id}>
              {tier.name}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="features" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Feature Management</CardTitle>
              <CardDescription>Create and manage features that can be assigned to subscription tiers</CardDescription>
            </CardHeader>
            <CardContent>
              <FeatureManagement />
            </CardContent>
          </Card>
        </TabsContent>

        {tiers?.map((tier) => (
          <TabsContent key={tier.id} value={tier.id} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>{tier.name} Features</CardTitle>
                <CardDescription>
                  Manage which features are available in the {tier.name} subscription tier
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SubscriptionTierFeatures tierId={tier.id} />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
