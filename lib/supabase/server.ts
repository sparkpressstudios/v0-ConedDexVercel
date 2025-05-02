import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies as nextCookies } from "next/headers"
import type { Database } from "@/lib/database.types"

// Create a function that can be used in both client and server contexts
export function createServerClient(cookieStore?: any) {
  // If cookieStore is provided, use it (for middleware and other contexts)
  // Otherwise, try to use next/headers (only works in server components)
  const cookies =
    cookieStore ||
    (() => {
      try {
        return nextCookies()
      } catch (e) {
        console.error(
          "Failed to access cookies from next/headers. This function must be used in a Server Component or API Route.",
        )
        // Return a minimal implementation that won't break things
        return {
          get: () => undefined,
          getAll: () => [],
        }
      }
    })()

  return createServerComponentClient<Database>({ cookies })
}

export function createClient() {
  return createServerComponentClient<Database>({ cookies: nextCookies() })
}
