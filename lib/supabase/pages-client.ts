import { createClient as createSupabaseClient } from "@supabase/supabase-js"

// This client is safe to use in the Pages Router
export function createPagesClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Helper function to get the current session in Pages Router
export async function getPagesSession() {
  const supabase = createPagesClient()
  return await supabase.auth.getSession()
}

// Helper function to get the current user in Pages Router
export async function getPagesUser() {
  const supabase = createPagesClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
