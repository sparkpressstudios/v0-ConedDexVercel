import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Use environment variables or fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || ""

let supabaseClientSingleton: ReturnType<typeof createSupabaseClient<Database>> | null = null

// This ensures we don't instantiate multiple clients
export function createClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("Supabase URL or Anon Key not found. Some features may not work correctly.")
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

// Alias for the createClient function for improved naming
export const getSupabaseClient = createClient
