import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Create a standalone Supabase client for Pages Router
// This doesn't use next/headers at all
export function createPagesClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient<Database>(supabaseUrl, supabaseAnonKey)
}
