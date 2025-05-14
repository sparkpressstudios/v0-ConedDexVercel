import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Use environment variables or fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

let supabaseClientSingleton: ReturnType<typeof createSupabaseClient<Database>> | null = null

// This ensures we don't instantiate multiple clients
export function createClient() {
  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined"

  // For browser environments, use the NEXT_PUBLIC variables
  // For server environments, use the regular variables
  const supabaseUrl = isBrowser
    ? process.env.NEXT_PUBLIC_SUPABASE_URL
    : process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL

  const supabaseAnonKey = isBrowser
    ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    : process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If we don't have the required variables, return a mock client that won't throw errors
  if (!supabaseUrl || !supabaseAnonKey) {
    if (isBrowser) {
      console.warn("Supabase URL or Anon Key not found in browser environment. Using mock client.")
    }

    // Create a singleton mock client that won't throw errors
    if (!supabaseClientSingleton) {
      supabaseClientSingleton = createMockClient()
    }
    return supabaseClientSingleton
  }

  // Create the client once and reuse it
  if (!supabaseClientSingleton) {
    supabaseClientSingleton = createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
      },
    })
  }

  return supabaseClientSingleton
}

// Create a mock client that won't throw errors
function createMockClient() {
  // This is a simplified mock that prevents errors when Supabase is not configured
  return {
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      getSession: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    },
    from: () => ({
      select: () => ({ data: null, error: null }),
      insert: () => ({ data: null, error: null }),
      update: () => ({ data: null, error: null }),
      delete: () => ({ data: null, error: null }),
    }),
  } as any
}

// Alias for the createClient function for improved naming
export const getSupabaseClient = createClient
