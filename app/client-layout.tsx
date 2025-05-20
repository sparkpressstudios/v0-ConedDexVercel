"use client"

import type React from "react"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"
import { KeyboardNavigation } from "@/components/ui/keyboard-navigation"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Register service worker
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      const swPath = "/sw-register.js"
      navigator.serviceWorker
        .register(swPath)
        .then((registration) => {
          console.log("Service Worker registered with scope:", registration.scope)
        })
        .catch((error) => {
          console.error("Service Worker registration failed:", error)
        })
    }
  }, [])

  return (
    <GlobalErrorBoundary>
      <AnalyticsTracker pathname={pathname}>
        <KeyboardNavigation>
          {children}
          <InstallPrompt />
          <OfflineIndicator />
        </KeyboardNavigation>
      </AnalyticsTracker>
    </GlobalErrorBoundary>
  )
}

export default ClientLayout
