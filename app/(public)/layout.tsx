import type React from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { redirect } from "next/navigation"
import type { Database } from "@/lib/database.types"

export const dynamic = "force-dynamic"

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  // Create the Supabase client directly in the component
  const supabase = createServerComponentClient<Database>({ cookies })

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Error getting session:", error)
  }

  // If user is logged in and tries to access auth pages, redirect to dashboard
  if (session) {
    const url = new URL(headers().get("x-url") || "/")
    if (url.pathname === "/login" || url.pathname === "/signup") {
      redirect("/dashboard")
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
