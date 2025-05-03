/**
 * Runtime detection utilities for Next.js
 * Automatically detects whether code is running in App Router or Pages Router
 * without requiring environment variables
 */

// Safe way to detect if we're in a browser environment
export const isBrowser = typeof window !== "undefined"

// Detect at build time if we're in the Pages Router
export function isPagesRouterBuild(): boolean {
  try {
    // Try to require next/headers as a test
    // This will throw in Pages Router
    require("next/headers")
    return false // We're in the App Router
  } catch (e) {
    return true // We're in the Pages Router
  }
}

// Runtime detection for client components
export function isPagesRouter(): boolean {
  if (isBrowser) {
    // Client-side detection
    // Check for Next.js Pages Router specific elements
    return document.querySelector("div#__next") !== null || window.location.pathname.startsWith("/_next/data/")
  }

  // Server-side detection
  return isPagesRouterBuild()
}

// Safe import function that won't break in either router
export function safeRequire(modulePath: string, fallbackValue: any = null): any {
  try {
    return require(modulePath)
  } catch (e) {
    return fallbackValue
  }
}

// Safe cookies function that works in both routers
export function getSafeCookies() {
  if (isPagesRouterBuild()) {
    // Pages Router implementation
    return {
      get: (name: string) => null,
      getAll: () => [],
      set: () => {},
      delete: () => {},
    }
  } else {
    // App Router implementation
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
}
