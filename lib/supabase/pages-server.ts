import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// This is a Pages Router compatible version that doesn't use next/headers
export function createPagesServerClient() {
  // Use environment variables directly instead of cookies
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
}

// Add the missing createClient export for Pages Router
export function createPagesClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
