import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../database.types"

// This is a Pages Router specific auth utility that doesn't use next/headers
export async function getPagesAuthUser() {
  const supabase = createClientComponentClient<Database>()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session?.user || null
}

export async function pagesSignOut() {
  const supabase = createClientComponentClient<Database>()
  await supabase.auth.signOut()
}

export async function pagesSignIn(email: string, password: string) {
  const supabase = createClientComponentClient<Database>()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

export async function pagesSignUp(email: string, password: string) {
  const supabase = createClientComponentClient<Database>()
  return supabase.auth.signUp({
    email,
    password,
  })
}
