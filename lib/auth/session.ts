import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function getSession() {
  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

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
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

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
    const cookieStore = cookies()
    const supabase = createServerComponentClient<Database>({ cookies: () => cookieStore })

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
