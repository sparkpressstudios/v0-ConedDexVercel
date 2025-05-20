import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { notFound, redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { AddFlavorForm } from "@/components/shop/add-flavor-form"

export async function generateMetadata({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  const { data: shop } = await supabase.from("shops").select("name").eq("id", params.id).single()

  return {
    title: shop ? `Add Flavor to ${shop.name} | ConeDex` : "Add Flavor | ConeDex",
    description: "Add a new flavor to this ice cream shop",
  }
}

export default async function AddFlavorPage({ params }: { params: { id: string } }) {
  const cookieStore = cookies()
  const supabase = createServerClient(cookieStore)

  // Check if user is logged in
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (!session) {
    redirect("/login?redirect=/dashboard/shops/" + params.id + "/add-flavor")
  }

  try {
    // Fetch shop details
    const { data: shop, error } = await supabase
      .from("shops")
      .select("id, name, city, state")
      .eq("id", params.id)
      .single()

    if (error || !shop) {
      console.error("Error fetching shop:", error)
      notFound()
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/shops/${params.id}`}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Add New Flavor</h1>
            <p className="text-muted-foreground">
              Add a flavor you discovered at {shop.name} in {shop.city}, {shop.state}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Flavor Details</CardTitle>
            <CardDescription>
              Share the details of this flavor with the ConeDex community. Your submission will be reviewed before being
              published.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddFlavorForm shopId={params.id} shopName={shop.name} userId={session.user.id} />
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Error in AddFlavorPage:", error)
    notFound()
  }
}
