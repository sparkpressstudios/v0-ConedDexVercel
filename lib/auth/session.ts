// This file is for server-side usage in the App Router ONLY
// DO NOT import this file in the Pages Router or client components

import { createServerClient } from "@/lib/supabase/server"

export async function getSession() {
  try {
    const supabase = createServerClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getUserDetails() {
  try {
    const supabase = createServerClient()

    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      return null
    }

    const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.user.id).single()

    return {
      ...user.user,
      profile,
    }
  } catch (error) {
    console.error("Error getting user details:", error)
    return null
  }
}

export async function getUserRole() {
  try {
    const supabase = createServerClient()

    const { data: user } = await supabase.auth.getUser()

    if (!user.user) {
      return null
    }

    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.user.id).single()

    return profile?.role || null
  } catch (error) {
    console.error("Error getting user role:", error)
    return null
  }
}
