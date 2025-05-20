"use client"

import { useState, useEffect, type ReactNode } from "react"
import { GlobalErrorBoundary } from "@/components/ui/global-error-boundary"

export function ClientLayout({ children }: { children: ReactNode }) {
  const [hasHydrated, setHasHydrated] = useState(false)

  // Mark when hydration has completed
  useEffect(() => {
    setHasHydrated(true)
  }, [])

  // Add some diagnostic logging
  useEffect(() => {
    console.log("Client layout mounted")

    // Report any unhandled errors
    const originalOnError = window.onerror
    window.onerror = function (message, source, lineno, colno, error) {
      console.error("Unhandled error:", { message, source, lineno, colno, error })
      if (originalOnError) {
        return originalOnError.apply(this, [message, source, lineno, colno, error])
      }
      return false
    }

    return () => {
      window.onerror = originalOnError
    }
  }, [])

  return (
    <GlobalErrorBoundary>
      {!hasHydrated ? (
        <div className="flex min-h-screen flex-col items-center justify-center p-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-pink-600 border-t-transparent"></div>
          <p className="mt-4 text-lg font-medium">Loading ConeDex...</p>
        </div>
      ) : (
        children
      )}
    </GlobalErrorBoundary>
  )
}

export default ClientLayout
