/**
 * Detects if the code is running in the Pages Router
 */
export function isPagesRouter(): boolean {
  // Check for specific environment variable
  if (process.env.NEXT_PUBLIC_RUNTIME === "pages") {
    return true
  }

  // Check if we're in a browser environment
  if (typeof window !== "undefined") {
    // Additional checks could be added here if needed
    return false
  }

  // Server-side detection
  try {
    // Try to require next/headers - this will fail in Pages Router
    require("next/headers")
    return false
  } catch (e) {
    return true
  }
}

/**
 * Detects if the code is running in the App Router
 */
export function isAppRouter(): boolean {
  return !isPagesRouter()
}
