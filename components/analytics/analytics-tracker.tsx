"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackEvent } from "@/app/actions/analytics"
import { v4 as uuidv4 } from "uuid"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sessionIdRef = useRef<string | null>(null)

  useEffect(() => {
    // Create or retrieve session ID
    if (!sessionIdRef.current) {
      const storedSessionId = localStorage.getItem("conedex_session_id")
      if (storedSessionId) {
        sessionIdRef.current = storedSessionId
      } else {
        const newSessionId = uuidv4()
        localStorage.setItem("conedex_session_id", newSessionId)
        sessionIdRef.current = newSessionId
      }
    }

    // Track page view
    const trackPageView = async () => {
      try {
        // Get device information
        const deviceType = getDeviceType()
        const browser = getBrowser()
        const os = getOS()
        const screenSize = `${window.innerWidth}x${window.innerHeight}`
        const referrer = document.referrer
        const appVersion = "1.0.0" // This should be dynamically determined in a real app

        // Track the page view
        await trackEvent({
          event_type: "page_view",
          event_data: {
            path: pathname,
            query: Object.fromEntries(searchParams.entries()),
          },
          session_id: sessionIdRef.current,
          device_type: deviceType,
          browser,
          os,
          screen_size: screenSize,
          referrer,
          page_url: window.location.href,
          app_version: appVersion,
        })
      } catch (error) {
        console.error("Error tracking page view:", error)
      }
    }

    trackPageView()

    // Track app installation if applicable
    if ("serviceWorker" in navigator) {
      window.addEventListener("appinstalled", (event) => {
        trackEvent({
          event_type: "app_installed",
          session_id: sessionIdRef.current,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_size: `${window.innerWidth}x${window.innerHeight}`,
          page_url: window.location.href,
          app_version: "1.0.0",
        })
      })
    }
  }, [pathname, searchParams])

  return null // This component doesn't render anything
}

// Helper functions to detect device information
function getDeviceType() {
  const ua = navigator.userAgent
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "tablet"
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return "mobile"
  }
  return "desktop"
}

function getBrowser() {
  const ua = navigator.userAgent

  if (ua.indexOf("Chrome") > -1) return "Chrome"
  if (ua.indexOf("Safari") > -1) return "Safari"
  if (ua.indexOf("Firefox") > -1) return "Firefox"
  if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) return "Internet Explorer"
  if (ua.indexOf("Edge") > -1) return "Edge"

  return "Unknown"
}

function getOS() {
  const ua = navigator.userAgent

  if (ua.indexOf("Windows") > -1) return "Windows"
  if (ua.indexOf("Mac") > -1) return "macOS"
  if (ua.indexOf("Linux") > -1) return "Linux"
  if (ua.indexOf("Android") > -1) return "Android"
  if (ua.indexOf("iOS") > -1 || ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) return "iOS"

  return "Unknown"
}
