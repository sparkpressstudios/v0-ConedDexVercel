// This file provides compatibility between App Router and Pages Router auth utilities
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "../database.types"

// Safe to use in both App Router and Pages Router
export function getSupabaseClient() {
  return createClientComponentClient<Database>()
}

// Safe to use in both App Router and Pages Router
export async function getAuthSession() {
  const supabase = getSupabaseClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Safe to use in both App Router and Pages Router
export async function getAuthUser() {
  const session = await getAuthSession()
  return session?.user || null
}

// Safe to use in both App Router and Pages Router
export async function signOut() {
  const supabase = getSupabaseClient()
  await supabase.auth.signOut()
}

// Safe to use in both App Router and Pages Router
export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient()
  return supabase.auth.signInWithPassword({
    email,
    password,
  })
}

// Safe to use in both App Router and Pages Router
export async function signUp(email: string, password: string) {
  const supabase = getSupabaseClient()
  return supabase.auth.signUp({
    email,
    password,
  })
}
