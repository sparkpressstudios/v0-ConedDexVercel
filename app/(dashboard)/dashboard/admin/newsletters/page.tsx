import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import NewsletterDashboard from "@/components/admin/newsletters/newsletter-dashboard"

export default async function NewslettersPage() {
  const supabase = createClient()

  // Check if user is admin
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/login")
  }

  // Get user role
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Newsletter Management</h1>
      <NewsletterDashboard />
    </div>
  )
}
