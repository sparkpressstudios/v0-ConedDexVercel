// This file is for server-side usage in the Pages Router ONLY
import { createPagesClient } from "@/lib/supabase/pages-client"

export async function getPagesSession() {
  try {
    const supabase = createPagesClient()

    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

export async function getPagesUserDetails() {
  try {
    const supabase = createPagesClient()

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

export async function getPagesUserRole() {
  try {
    const supabase = createPagesClient()

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
