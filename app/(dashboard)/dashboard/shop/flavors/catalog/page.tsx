import { FlavorCatalogGenerator } from "@/components/shop/flavor-catalog-generator"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function FlavorCatalogPage() {
  const supabase = createServerClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login")
  }

  // Get user's shop
  const { data: shop } = await supabase.from("shops").select("id, name").eq("owner_id", user.id).single()

  if (!shop) {
    redirect("/dashboard/shop/claim")
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Flavor Catalog</h1>
        <p className="text-muted-foreground">Generate a professional catalog of your shop's flavors</p>
      </div>

      <FlavorCatalogGenerator shopId={shop.id} shopName={shop.name} />

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-3">Why Create a Flavor Catalog?</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Share your flavor offerings with customers and partners</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Print physical menus or display in your shop</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Include in marketing materials and social media</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Provide to wholesale clients and event planners</span>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Catalog Features</h2>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Professional PDF format with your shop branding</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Customizable content including images and descriptions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Optional pricing information for wholesale clients</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="bg-primary/10 text-primary rounded-full p-1 mt-0.5">✓</span>
              <span>Automatically updated with your latest flavors</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}
