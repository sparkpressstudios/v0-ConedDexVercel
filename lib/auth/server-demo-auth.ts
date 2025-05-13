"use server"

import { cookies } from "next/headers"
import { getDemoUserData } from "./demo-auth"

export async function getServerDemoUser() {
  const cookieStore = cookies()
  const demoUserEmail = cookieStore.get("conedex_demo_user")?.value

  if (!demoUserEmail) {
    return null
  }

  const demoUsers = getDemoUserData()
  return demoUsers[demoUserEmail] || null
}

export async function setServerDemoUser(email: string): Promise<void> {
  const cookieStore = cookies()

  // Set the demo user cookie with a 24-hour expiration
  cookieStore.set("conedex_demo_user", email, {
    path: "/",
    maxAge: 86400, // 24 hours in seconds
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
  })
}

export async function clearServerDemoUser(): Promise<void> {
  const cookieStore = cookies()

  // Clear the demo user cookie
  cookieStore.delete("conedex_demo_user")
}
