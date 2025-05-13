export const dynamic = "force-dynamic"

import type React from "react"
import { redirect } from "next/navigation"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
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

    let profile: any = null

    if (session) {
      // Get user profile from Supabase
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        throw error
      }

      profile = profileData
    } else if (demoUser) {
      // Create a profile object that matches the structure expected by components
      profile = {
        id: demoUser.id,
        username: demoUser.email.split("@")[0],
        full_name: demoUser.name,
        role: demoUser.role,
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.name.replace(" ", "")}`,
        bio: `This is a demo ${demoUser.role} account.`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        favorite_flavor:
          demoUser.role === "admin"
            ? "Rocky Road"
            : demoUser.role === "shop_owner"
              ? "Vanilla Bean"
              : "Mint Chocolate Chip",
      }
    }

    return (
      <GlobalErrorBoundary>
        <div className="flex min-h-screen flex-col">
          <DashboardHeader user={profile} />
          <div className="flex flex-1">
            <div className="hidden md:block">
              <DashboardSidebar />
            </div>
            <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          </div>
          <Toaster />
          <OfflineIndicator />
          <InstallPrompt />
        </div>
      </GlobalErrorBoundary>
    )
  } catch (error) {
    console.error("Dashboard layout error:", error)
    return redirect("/login?error=dashboard")
  }
}
