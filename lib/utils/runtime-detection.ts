/**
 * Runtime detection utilities for Next.js
 * Automatically detects whether code is running in App Router or Pages Router
 */

// Detect at runtime if we're in the Pages Router
export function isPagesRouter(): boolean {
  // Check if window is defined (client-side)
  if (typeof window !== "undefined") {
    // Client-side detection based on URL patterns
    const pathname = window.location.pathname

    // Check for known Pages Router paths
    if (pathname.startsWith("/_next/")) {
      return true
    }

    // Check for __PAGES_ROUTER__ global (set by webpack)
    if (typeof (window as any).__PAGES_ROUTER__ !== "undefined") {
      return (window as any).__PAGES_ROUTER__
    }

    // Default to App Router for client-side
    return false
  }

  // Server-side detection
  try {
    // Try to access headers() function which only exists in App Router
    require("next/headers")
    return false // App Router
  } catch (e) {
    // If we get here, we're in the Pages Router
    return true
  }
}

// Safe import function that won't break the build
export function safeRequire(modulePath: string, fallbackValue: any = null): any {
  try {
    return require(modulePath)
  } catch (e) {
    return fallbackValue
  }
}

// Create a safe cookies function that works in both routers
export function getSafeCookies() {
  try {
    const { cookies } = require("next/headers")
    return cookies()
  } catch (e) {
    // Fallback implementation
    return {
      get: (name: string) => null,
      getAll: () => [],
      set: () => {},
      delete: () => {},
    }
  }
}
