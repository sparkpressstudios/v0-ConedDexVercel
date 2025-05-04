"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"

export function PreviewModeHandler({ children }: { children: React.ReactNode }) {
  const [isPreview, setIsPreview] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're in a preview environment
    // This works in Vercel Preview deployments and local development
    const isPreviewEnvironment =
      typeof window !== "undefined" &&
      // Check for Vercel preview URL pattern
      (window.location.hostname.includes("vercel.app") ||
        // Check for localhost
        window.location.hostname === "localhost" ||
        // Check for 127.0.0.1
        window.location.hostname === "127.0.0.1")

    setIsPreview(isPreviewEnvironment)
  }, [])

  // If we're in a preview environment, render the children
  // Otherwise, let the normal auth flow handle it
  return <>{children}</>
}
