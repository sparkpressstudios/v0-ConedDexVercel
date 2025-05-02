import { createServerClient } from "@/lib/supabase/server"
import { StripeProductMappingForm } from "@/components/admin/stripe-product-mapping-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { redirect } from "next/navigation"

export default async function StripeMappingPage() {
  const supabase = createServerClient()

  // Check if user is authenticated and is an admin
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/admin/stripe-mapping")
  }

  // Get user role
  const { data: user } = await supabase.from("users").select("role").eq("id", session.user.id).single()

  // If not admin, redirect to dashboard
  if (!user || user.role !== "admin") {
    redirect("/dashboard")
  }

  // Fetch subscription tiers
  const { data: tiers } = await supabase.from("subscription_tiers").select("*").order("price", { ascending: true })

  // Fetch existing mappings
  const { data: mappings } = await supabase.from("subscription_tiers_stripe_mapping").select("*")

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Stripe Product Mapping</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Map Stripe Products to Subscription Tiers</CardTitle>
          <CardDescription>
            Enter your existing Stripe product and price IDs to map them to ConeDex subscription tiers.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StripeProductMappingForm tiers={tiers || []} existingMappings={mappings || []} />
        </CardContent>
      </Card>
    </div>
  )
}
