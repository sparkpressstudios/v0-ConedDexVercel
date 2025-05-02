"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { trackEvent } from "@/app/actions/analytics"
import { v4 as uuidv4 } from "uuid"

export function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const sessionIdRef = useRef<string | null>(null)
  const [isAnalyticsEnabled, setIsAnalyticsEnabled] = useState<boolean>(true)
  const [analyticsError, setAnalyticsError] = useState<boolean>(false)

  useEffect(() => {
    // Check if analytics should be enabled
    try {
      const analyticsDisabled = localStorage.getItem("conedex_analytics_disabled") === "true"
      setIsAnalyticsEnabled(!analyticsDisabled)
    } catch (error) {
      console.warn("Error checking analytics preferences:", error)
      // Default to enabled if we can't check preferences
      setIsAnalyticsEnabled(true)
    }

    // Create or retrieve session ID
    if (!sessionIdRef.current) {
      try {
        const storedSessionId = localStorage.getItem("conedex_session_id")
        if (storedSessionId) {
          sessionIdRef.current = storedSessionId
        } else {
          const newSessionId = uuidv4()
          localStorage.setItem("conedex_session_id", newSessionId)
          sessionIdRef.current = newSessionId
        }
      } catch (error) {
        console.warn("Error managing session ID:", error)
        // Generate a temporary session ID if localStorage is not available
        sessionIdRef.current = uuidv4()
      }
    }
  }, [])

  useEffect(() => {
    // Don't track if analytics is disabled or if we've had a previous error
    if (!isAnalyticsEnabled || analyticsError) return

    // Track page view
    const trackPageView = async () => {
      try {
        // Get device information safely
        let deviceType = "unknown"
        let browser = "unknown"
        let os = "unknown"
        let screenSize = "unknown"
        let referrer = ""
        let pageUrl = ""

        try {
          deviceType = getDeviceType()
          browser = getBrowser()
          os = getOS()
          screenSize = `${window.innerWidth}x${window.innerHeight}`
          referrer = document.referrer
          pageUrl = window.location.href
        } catch (infoError) {
          console.warn("Error getting device info:", infoError)
        }

        // Track the page view
        const result = await trackEvent({
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
          page_url: pageUrl,
          app_version: "1.0.0",
        })

        if (!result.success) {
          console.warn("Analytics tracking failed:", result.error)
          // Disable analytics for this session if we encounter an error
          setAnalyticsError(true)
        }
      } catch (error) {
        console.warn("Error tracking page view:", error)
        // Disable analytics for this session if we encounter an error
        setAnalyticsError(true)
      }
    }

    // Delay tracking slightly to ensure the page has loaded
    const timeoutId = setTimeout(() => {
      trackPageView()
    }, 100)

    return () => clearTimeout(timeoutId)
  }, [pathname, searchParams, isAnalyticsEnabled, analyticsError])

  useEffect(() => {
    // Track app installation if applicable and analytics is enabled
    if (!isAnalyticsEnabled || analyticsError || !("serviceWorker" in navigator)) return

    const handleAppInstalled = async (event: Event) => {
      try {
        const result = await trackEvent({
          event_type: "app_installed",
          session_id: sessionIdRef.current,
          device_type: getDeviceType(),
          browser: getBrowser(),
          os: getOS(),
          screen_size: `${window.innerWidth}x${window.innerHeight}`,
          page_url: window.location.href,
          app_version: "1.0.0",
        })

        if (!result.success) {
          console.warn("App installation tracking failed:", result.error)
          setAnalyticsError(true)
        }
      } catch (error) {
        console.warn("Error tracking app installation:", error)
        setAnalyticsError(true)
      }
    }

    window.addEventListener("appinstalled", handleAppInstalled)
    return () => window.removeEventListener("appinstalled", handleAppInstalled)
  }, [isAnalyticsEnabled, analyticsError])

  return null // This component doesn't render anything
}

// Helper functions to detect device information
function getDeviceType() {
  try {
    const ua = navigator.userAgent
    if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
      return "tablet"
    }
    if (
      /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)
    ) {
      return "mobile"
    }
    return "desktop"
  } catch (error) {
    return "unknown"
  }
}

function getBrowser() {
  try {
    const ua = navigator.userAgent

    if (ua.indexOf("Chrome") > -1) return "Chrome"
    if (ua.indexOf("Safari") > -1) return "Safari"
    if (ua.indexOf("Firefox") > -1) return "Firefox"
    if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1) return "Internet Explorer"
    if (ua.indexOf("Edge") > -1) return "Edge"

    return "Unknown"
  } catch (error) {
    return "unknown"
  }
}

function getOS() {
  try {
    const ua = navigator.userAgent

    if (ua.indexOf("Windows") > -1) return "Windows"
    if (ua.indexOf("Mac") > -1) return "macOS"
    if (ua.indexOf("Linux") > -1) return "Linux"
    if (ua.indexOf("Android") > -1) return "Android"
    if (ua.indexOf("iOS") > -1 || ua.indexOf("iPhone") > -1 || ua.indexOf("iPad") > -1) return "iOS"

    return "Unknown"
  } catch (error) {
    return "unknown"
  }
}
