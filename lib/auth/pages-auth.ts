"use client"

import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { useState, useEffect } from "react"
import { redirect } from "next/navigation"

// Export the createPagesClient function
export function createPagesClient() {
  return createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)
}

export async function getUser() {
  const supabase = createPagesClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
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

// Add the usePagesAuth hook
export function usePagesAuth() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createPagesClient()

    // Get the current session
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user || null)
      setLoading(false)
    }

    getSession()

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading, signIn: pagesSignIn, signOut: pagesSignOut, demoLogin: demoLoginPages }
}

export async function signIn(email: string, password: string) {
  return pagesSignIn(email, password)
}

export async function signUp(email: string, password: string) {
  const supabase = createPagesClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    throw error
  }

  return data
}

export async function signOut() {
  return pagesSignOut()
}

export async function requireAuth() {
  const user = await getUser()

  if (!user) {
    redirect("/login")
  }

  return user
}
