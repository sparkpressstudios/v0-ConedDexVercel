"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <ErrorBoundary
      fallback={<div className="p-8 text-center">Something went wrong. Please try refreshing the page.</div>}
    >
      {children}
    </ErrorBoundary>
  )
}
