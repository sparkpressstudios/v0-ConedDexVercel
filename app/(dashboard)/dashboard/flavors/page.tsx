import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { FlavorDetailView } from "@/components/flavor/flavor-detail-view"
import { ConedexBrowser } from "@/components/flavor/conedex-browser"

export const metadata = {
  title: "Flavors | ConeDex",
  description: "Browse and discover ice cream flavors in the ConeDex database",
}

export default async function FlavorsPage() {
  const supabase = createServerClient()

  // Fetch featured flavors
  const { data: featuredFlavors } = await supabase
    .from("flavors")
    .select("*")
    .order("popularity", { ascending: false })
    .limit(5)

  // Fetch flavor categories
  const { data: categories } = await supabase.from("flavor_categories").select("*").order("name")

  return (
    <div className="container mx-auto">
      <h1 className="text-3xl font-bold mb-6">Flavor Explorer</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Browse Flavors</h2>
            <Suspense fallback={<div>Loading flavor browser...</div>}>
              <ConedexBrowser initialFlavors={featuredFlavors || []} categories={categories || []} />
            </Suspense>
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-semibold mb-4">Flavor Details</h2>
            <Suspense fallback={<div>Loading flavor details...</div>}>
              <FlavorDetailView />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
