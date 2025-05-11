import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export async function getSession() {
  const supabase = createServerComponentClient<Database>({ cookies })
  try {
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
  const supabase = createServerComponentClient<Database>({ cookies })
  try {
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
  const supabase = createServerComponentClient<Database>({ cookies })
  try {
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
