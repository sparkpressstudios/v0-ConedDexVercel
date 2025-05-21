export const dynamic = "force-dynamic"

import type React from "react"
import { cookies } from "next/headers"
import { ImprovedDashboardSidebar } from "@/components/layout/improved-dashboard-sidebar"
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Shell } from "@/components/shell"
import { createServerClient } from "@/lib/supabase/server"
import ClientLayout from "../client-layout"
import { LoginPanel } from "@/components/auth/login-panel"
import { IceCream } from "lucide-react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  try {
    // Check for demo user first
    const cookieStore = cookies()
    const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
    let profile = null
    let isAuthenticated = false

    // If we have a demo user, use that
    if (demoUserEmail) {
      // Demo user data
      const demoUsers: Record<string, any> = {
        "admin@conedex.app": {
          email: "admin@conedex.app",
          role: "admin",
          id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
          name: "Alex Admin",
        },
        "shopowner@conedex.app": {
          email: "shopowner@conedex.app",
          role: "shop_owner",
          id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
          name: "Sam Scooper",
        },
        "explorer@conedex.app": {
          email: "explorer@conedex.app",
          role: "explorer",
          id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
          name: "Emma Explorer",
        },
      }

      const demoUser = demoUsers[demoUserEmail as keyof typeof demoUsers]

      if (demoUser) {
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
        isAuthenticated = true
        return renderDashboardLayout(children, profile)
      }
    }

    // Try to create the Supabase client
    let supabase
    try {
      supabase = createServerClient()
    } catch (error) {
      console.error("Failed to create Supabase client:", error)
      return renderLoginLayout()
    }

    // Check if user is authenticated with Supabase
    let session
    try {
      const { data, error } = await supabase.auth.getSession()
      if (error) throw error
      session = data.session
    } catch (error) {
      console.error("Failed to get session:", error)
      return renderLoginLayout()
    }

    // If no session, show login
    if (!session) {
      return renderLoginLayout()
    }

    // Get user profile from Supabase
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
      if (error && error.code !== "PGRST116") throw error
      profile = data || {
        id: session.user.id,
        username: session.user.email?.split("@")[0] || "User",
        full_name: session.user.email?.split("@")[0] || "User",
        role: "explorer",
        avatar_url: null,
      }
      isAuthenticated = true
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
      isAuthenticated = true
    }

    return renderDashboardLayout(children, profile)
  } catch (error) {
    console.error("Dashboard layout error:", error)
    return renderLoginLayout()
  }
}

// Helper function to render the dashboard layout
function renderDashboardLayout(children: React.ReactNode, profile: any) {
  return (
    <GlobalErrorBoundary>
      <ClientLayout>
        <ThemeProvider>
          <div className="flex h-screen flex-col md:flex-row bg-white">
            <ImprovedDashboardSidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
              <DashboardHeader user={profile} />
              <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>
              <MobileBottomNav />
              <Toaster />
              <OfflineIndicator />
              <InstallPrompt />
            </div>
          </div>
        </ThemeProvider>
      </ClientLayout>
    </GlobalErrorBoundary>
  )
}

// Helper function to render the login layout
function renderLoginLayout() {
  return (
    <Shell layout="full">
      <ClientLayout>
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-background h-16 flex items-center px-6">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-purple-900 p-1">
                <IceCream className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold">ConeDex</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-6">
            <div className="max-w-md mx-auto mt-8">
              <LoginPanel
                redirectPath="/dashboard"
                showSignupLink={true}
                showForgotPassword={true}
                showDemoAccess={true}
                className="w-full"
              />
            </div>
          </main>
        </div>
      </ClientLayout>
    </Shell>
  )
}
