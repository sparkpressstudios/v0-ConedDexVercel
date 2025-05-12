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
