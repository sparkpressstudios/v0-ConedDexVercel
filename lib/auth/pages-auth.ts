import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

// Export the createPagesClient function
export function createPagesClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

// Export the pagesSignIn function
export async function pagesSignIn(email: string, password: string) {
  const supabase = createPagesClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(error.message)
  }

  return data
}

// Demo login function for Pages Router
export const demoLoginPages = async (role: string) => {
  const supabase = createPagesClient()

  let email = ""
  let password = ""

  switch (role) {
    case "admin":
      email = "admin@conedex.com"
      password = process.env.DEMO_ADMIN_PASSWORD || "demo-password"
      break
    case "explorer":
      email = "explorer@conedex.com"
      password = process.env.DEMO_EXPLORER_PASSWORD || "demo-password"
      break
    case "shopowner":
      email = "shopowner@conedex.com"
      password = process.env.DEMO_SHOPOWNER_PASSWORD || "demo-password"
      break
    default:
      throw new Error("Invalid role")
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

// Add other auth-related functions as needed
export async function pagesSignOut() {
  const supabase = createPagesClient()
  return await supabase.auth.signOut()
}

export async function pagesGetSession() {
  const supabase = createPagesClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
