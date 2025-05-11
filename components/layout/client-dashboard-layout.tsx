"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
import { getDemoUserFromCookie, createDemoProfile } from "@/lib/utils/dashboard-utils"

export function ClientDashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const supabase = createClient()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        // Check if user is authenticated with Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // Check for demo user in cookies
        const demoUser = getDemoUserFromCookie()

        // If no session and no demo user, redirect to login
        if (!session && !demoUser) {
          router.push("/login")
          return
        }

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

          setProfile(profileData)
        } else if (demoUser) {
          // Use demo user data
          setProfile(createDemoProfile(demoUser))
        }
      } catch (error) {
        console.error("Dashboard layout error:", error)
        router.push("/login?error=dashboard")
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [router, supabase])

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>
  }

  return (
    <GlobalErrorBoundary>
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
    </GlobalErrorBoundary>
  )
}
