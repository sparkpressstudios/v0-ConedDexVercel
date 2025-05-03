/**
 * Runtime detection utilities for Next.js
 * Automatically detects whether code is running in App Router or Pages Router
 */

// Detect at build time if we're in the Pages Router
export function isPagesRouterBuild(): boolean {
  try {
    // This will throw an error if we're in the Pages Router
    require("next/headers")
    return false
  } catch (e) {
    // If we get here, we're in the Pages Router
    return true
  }
}

// Detect at runtime if we're in the Pages Router
export function isPagesRouter(): boolean {
  // Check if window is defined (client-side)
  if (typeof window !== "undefined") {
    // Client-side detection based on URL patterns
    // App Router uses trailing slashes by default, Pages Router doesn't
    const pathname = window.location.pathname

    // Check for known Pages Router paths
    if (pathname.startsWith("/_next/")) {
      return true
    }

    // Additional heuristics can be added here

    // Default to App Router for client-side
    return false
  }

  // Server-side detection
  try {
    // Try to access headers() function which only exists in App Router
    const headers = require("next/headers")
    if (typeof headers.headers === "function") {
      return false // App Router
    }
  } catch (e) {
    // If we get here, we're in the Pages Router
    return true
  }

  // Check for Pages Router specific modules
  try {
    require("next/router")
    return true // Pages Router
  } catch (e) {
    // If next/router isn't available, we're likely in App Router
  }

  // Default to App Router if we can't determine
  return false
}

// Safe import function that won't break the build
export function safeImport(appRouterModule: string, fallbackValue: any = null): any {
  if (isPagesRouterBuild()) {
    return fallbackValue
  }

  try {
    return require(appRouterModule)
  } catch (e) {
    return fallbackValue
  }
}

// Create a safe cookies function that works in both routers
export function getSafeCookies() {
  if (isPagesRouterBuild()) {
    // Return a dummy cookies function for Pages Router
    return {
      get: (name: string) => null,
      getAll: () => [],
      set: () => {},
      delete: () => {},
    }
  }

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
