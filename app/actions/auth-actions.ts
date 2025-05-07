"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Server action to sign in a user
 */
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return {
      error: "Email and password are required",
    }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  redirect("/dashboard")
}

/**
 * Server action to sign out a user
 */
export async function logout() {
  const supabase = createClient()
  await supabase.auth.signOut()
  redirect("/login")
}

/**
 * Server action to sign up a new user
 */
export async function signup(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const name = formData.get("name") as string
  const role = formData.get("role") as string

  if (!email || !password || !name || !role) {
    return {
      error: "All fields are required",
    }
  }

  const supabase = createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        role,
      },
    },
  })

  if (error) {
    return {
      error: error.message,
    }
  }

  return {
    success: true,
    message: "Account created successfully",
  }
}
