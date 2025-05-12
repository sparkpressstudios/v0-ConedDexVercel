"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"

// Function to get the current session
export async function getSession() {
  const supabase = createServerActionClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return session
}

// Function to get the current user
export async function getCurrentUser() {
  const session = await getSession()
  return session?.user || null
}

// Function to get the user role
export async function getUserRole() {
  const session = await getSession()
  if (!session) return null

  const supabase = createServerActionClient({ cookies })
  const { data } = await supabase.from("users").select("role").eq("id", session.user.id).single()
  return data?.role || null
}

// Function to check if the user is an admin
export async function isAdmin() {
  const role = await getUserRole()
  return role === "admin"
}

// Function to check if the user is a shop owner
export async function isShopOwner() {
  const role = await getUserRole()
  return role === "shop_owner"
}

// Function to handle demo login
export async function handleDemoLogin(email: string) {
  const cookieStore = cookies()
  cookieStore.set("conedex_demo_user", email, {
    path: "/",
    maxAge: 60 * 60 * 24, // 1 day
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })

  redirect("/dashboard")
}

// Function to handle logout
export async function handleLogout() {
  const cookieStore = cookies()
  cookieStore.delete("conedex_demo_user")

  const supabase = createServerActionClient({ cookies })
  await supabase.auth.signOut()

  redirect("/")
}
