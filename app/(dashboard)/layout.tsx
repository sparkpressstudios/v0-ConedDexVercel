export const dynamic = "force-dynamic"

import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { getDemoUser } from "@/lib/auth/session"
import type { Database } from "@/lib/database.types"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if user is authenticated with Supabase
    const {
      data: { session },
    } = await supabase.auth.getSession()

    // Check for demo user in cookies
    const demoUser = getDemoUser()

    // If no session and no demo user, redirect to login
    if (!session && !demoUser) {
      return redirect("/login")
    }

    // Continue to the children components which will handle specific layouts
    return <>{children}</>
  } catch (error) {
    console.error("Dashboard layout error:", error)
    return redirect("/login?error=dashboard")
  }
}
