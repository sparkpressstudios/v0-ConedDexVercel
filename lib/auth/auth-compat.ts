import { createClient } from "@/lib/supabase/client"

/**
 * Sign in with email and password
 */
export async function signIn(email: string, password: string) {
  const supabase = createClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

/**
 * Sign up with email and password
 */
export async function signUp(email: string, password: string, userData: any = {}) {
  const supabase = createClient()
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: userData,
    },
  })
}

/**
 * Sign out the current user
 */
export async function signOut() {
  const supabase = createClient()
  return supabase.auth.signOut()
}

/**
 * Get the current session
 */
export async function getSession() {
  const supabase = createClient()
  return supabase.auth.getSession()
}

/**
 * Get the current user
 */
export async function getUser() {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  return data.user
}
