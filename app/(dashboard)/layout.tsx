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
import { Shell } from "@/components/shell"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    // Check for demo user first
    const demoUser = getDemoUser()

    // If we have a demo user, use that
    if (demoUser) {
      // Create a profile object that matches the structure expected by components
      const profile = {
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

      return renderDashboardLayout(children, profile)
    }

    // Try to create the Supabase client
    let supabase
    try {
      supabase = createServerComponentClient<Database>({ cookies })
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return renderErrorLayout(children, "Database connection error")
    }

    // Check if user is authenticated with Supabase
    let session
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      session = data.session
    } catch (error) {
      console.error("Failed to get session:", error)
      return renderErrorLayout(children, "Authentication error")
    }

    // If no session, redirect to login
    if (!session) {
      return redirect("/login")
    }

    // Get user profile from Supabase
    let profile
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      if (error) throw error
      profile = data
    } catch (error) {
      console.error("Error fetching profile:", error)
      // Don't throw the error, provide a fallback profile instead
      profile = {
        id: session.user.id,
        username: session.user.email?.split("@")[0] || "User",
        full_name: session.user.email?.split("@")[0] || "User",
        role: "explorer",
        avatar_url: null,
      }
    }

    return renderDashboardLayout(children, profile)
  } catch (error) {
    console.error("Dashboard layout error:", error)
    return renderErrorLayout(children, "Unexpected error")
  }
}

// Helper function to render the dashboard layout
function renderDashboardLayout(children: React.ReactNode, profile: any) {
  return (
    <GlobalErrorBoundary>
      <div className="flex h-screen flex-col md:flex-row bg-white">
        <DashboardSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <DashboardHeader user={profile} />
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
          <Toaster />
          <OfflineIndicator />
          <InstallPrompt />
        </div>
      </div>
    </GlobalErrorBoundary>
  )
}

// Helper function to render the error layout
function renderErrorLayout(children: React.ReactNode, errorMessage = "Dashboard error") {
  return (
    <Shell layout="full">
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background h-16 flex items-center px-6">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-purple-900 p-1">
              <IceCream className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ConeDex</span>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </Shell>
  )
}

// Import the IceCream icon
import { IceCream } from "lucide-react"
