import type React from "react"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
import { demoUsers } from "@/lib/utils/dashboard-utils"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <GlobalErrorBoundary>
      {async () => {
        try {
          const supabase = createServerClient()

          // Check if user is authenticated with Supabase
          const {
            data: { session },
          } = await supabase.auth.getSession()

          // Check for demo user in cookies
          const cookieStore = cookies()
          const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
          const isDemoUser = demoUserEmail && demoUsers[demoUserEmail]

          // If no session and no demo user, redirect to login
          if (!session && !isDemoUser) {
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
          } else if (isDemoUser) {
            // Use demo user data
            const demoUser = demoUsers[demoUserEmail!]

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
            <div className="flex min-h-screen flex-col">
              <DashboardHeader user={profile} />
              <div className="flex flex-1">
                <div className="hidden md:block">
                  <DashboardSidebar user={profile} />
                </div>
                <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
              </div>
              <Toaster />
              <OfflineIndicator />
              <InstallPrompt />
            </div>
          )
        } catch (error) {
          console.error("Dashboard layout error:", error)
          return redirect("/login?error=dashboard")
        }
      }}
    </GlobalErrorBoundary>
  )
}
