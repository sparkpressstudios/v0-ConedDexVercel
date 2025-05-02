import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for use in the Pages Router
export const createPagesClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Standard sign in function for Pages Router
export const pagesSignIn = async (email: string, password: string) => {
  const supabase = createPagesClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw error
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

// Get user session for Pages Router
export const getUserSessionPages = async () => {
  const supabase = createPagesClient()
  const { data } = await supabase.auth.getSession()
  return data.session
}
