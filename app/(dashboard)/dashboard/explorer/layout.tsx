import type React from "react"
import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { Toaster } from "@/components/ui/toaster"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"

export const dynamic = "force-dynamic"

export default async function ExplorerLayout({ children }: { children: React.ReactNode }) {
  // Check if user is explorer or has access to explorer features
  const userRole = await getUserRole()

  if (!userRole) {
    return redirect("/login")
  }

  return (
    <GlobalErrorBoundary>
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
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
}
