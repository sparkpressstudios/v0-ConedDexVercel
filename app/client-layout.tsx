"use client"

import type React from "react"

import { AuthProvider } from "@/contexts/auth-context"
import { useEffect, useState } from "react"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <GlobalErrorBoundary>
      <AuthProvider>
        <AnalyticsTracker />
        <OfflineIndicator />
        <InstallPrompt />
        {children}
      </AuthProvider>
    </GlobalErrorBoundary>
  )
}
