// This file provides a compatibility layer for Supabase that works in both App Router and Pages Router

// Detect if we're in a browser environment
const isBrowser = typeof window !== "undefined"

// Import the appropriate client based on the environment
import { createClient as createAppClient } from "./client"
import { createPagesClient } from "./pages-client"

// Export a function that returns the appropriate client
export function createCompatClient() {
  // In the browser, use the client-side client
  if (isBrowser) {
    return createAppClient()
  }

  // In Node.js (server-side), use the Pages client which doesn't rely on next/headers
  return createPagesClient()
}
