"use client"

import type React from "react"

import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { useEffect, useState } from "react"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  // Use state to ensure client-side rendering
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a simple loading state until client-side rendering kicks in
    return (
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-bold">Loading ConeDex...</h1>
          <p className="text-gray-500 mt-2">The ultimate ice cream explorer</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
      <OfflineIndicator />
      <InstallPrompt />
    </div>
  )
}
