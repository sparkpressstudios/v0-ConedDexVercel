"use client"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Create a mock client for when environment variables are missing
function createMockClient() {
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: (callback: any) => {
        // Return a subscription object with an unsubscribe method
        return { data: { subscription: { unsubscribe: () => {} } } }
      },
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  } as any
}

// Singleton instance
let clientInstance: any = null

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn("Supabase environment variables missing. Using mock client.")

    if (!clientInstance) {
      clientInstance = createMockClient()
    }
    return clientInstance
  }

  if (!clientInstance) {
    clientInstance = createClientComponentClient<Database>()
  }

  return clientInstance
}
