import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// This client is safe to use in the Pages Router
export function createPagesClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}
