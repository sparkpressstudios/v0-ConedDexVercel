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
    // Check if the essential environment variables are available
    const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      // If missing essential variables, provide a more graceful fallback experience
      return (
        <div className="flex min-h-screen flex-col">
          <div className="p-4 bg-red-50 text-red-600 rounded m-4">
            <h1 className="text-xl font-bold">Configuration Error</h1>
            <p>The application is missing essential configuration. Please contact the administrator.</p>
          </div>
          <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
        </div>
      )
    }

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
        // Don't throw the error, provide a fallback profile instead
        profile = {
          id: session.user.id,
          username: session.user.email?.split("@")[0] || "User",
          full_name: session.user.email?.split("@")[0] || "User",
          role: "explorer",
          avatar_url: null,
        }
      } else {
        profile = profileData
      }
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
    // Provide a more informative error display instead of redirecting
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex-1 flex items-center justify-center">
          <div className="p-6 max-w-md">
            <h1 className="text-xl font-bold mb-4">Dashboard Error</h1>
            <p className="mb-4">
              There was an error loading the dashboard. This might be due to missing configuration or connectivity
              issues.
            </p>
            <a href="/login" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              Return to Login
            </a>
          </div>
        </div>
      </div>
    )
  }
}
