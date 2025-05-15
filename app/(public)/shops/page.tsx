import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export default async function ShopsRedirectPage() {
  const cookieStore = cookies()
  const supabase = createServerClient()

  try {
    // Check if user is authenticated
    const { data } = await supabase.auth.getSession()

    if (data.session) {
      // If authenticated, redirect to dashboard explore shops
      redirect("/dashboard/explore-shops")
    } else {
      // If not authenticated, redirect to login with return URL
      redirect("/login?redirect=/dashboard/explore-shops")
    }
  } catch (error) {
    console.error("Error in shops redirect:", error)
    // If there's an error, redirect to login
    redirect("/login?redirect=/dashboard/explore-shops")
  }
}
