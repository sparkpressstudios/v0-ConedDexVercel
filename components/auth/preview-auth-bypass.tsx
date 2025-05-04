"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"

export function PreviewAuthBypass() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if we're in a preview environment
    const isPreviewEnvironment =
      typeof window !== "undefined" &&
      // Check for Vercel preview URL pattern
      (window.location.hostname.includes("vercel.app") ||
        // Check for localhost
        window.location.hostname === "localhost" ||
        // Check for 127.0.0.1
        window.location.hostname === "127.0.0.1")

    // If we're in a preview environment and on a login/auth page, redirect to home
    if (isPreviewEnvironment && (pathname.includes("/login") || pathname.includes("/signup"))) {
      router.push("/")
    }
  }, [pathname, router])

  return null
}
