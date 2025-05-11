import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Global variable to store the client instance
let supabaseClientSingleton: ReturnType<typeof createClientComponentClient<Database>> | null = null

// This ensures we don't instantiate multiple clients on the client side
export function createClient() {
  // Always create a new client on the server
  if (typeof window === "undefined") {
    return createClientComponentClient<Database>()
  }

  // Create the client once and reuse it on the client
  if (!supabaseClientSingleton) {
    supabaseClientSingleton = createClientComponentClient<Database>({
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    })
  }

  return supabaseClientSingleton
}
