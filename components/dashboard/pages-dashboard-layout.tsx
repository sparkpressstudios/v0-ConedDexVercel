"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { createClient } from "@/lib/supabase/pages-client"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"

export function DashboardLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function getProfileData() {
      try {
        const supabase = createClient()

        // Check if user is authenticated with Supabase
        const {
          data: { session },
        } = await supabase.auth.getSession()

        // If no session, redirect to login
        if (!session) {
          router.push("/login?redirect=" + router.asPath)
          return
        }

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
        setIsLoading(false)
      } catch (error) {
        console.error("Dashboard layout error:", error)
        router.push("/login?error=dashboard")
      }
    }

    getProfileData()
  }, [router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
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
