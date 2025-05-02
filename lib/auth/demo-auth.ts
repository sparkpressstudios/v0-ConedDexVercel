// Demo user types
export type DemoUserRole = "admin" | "shop_owner" | "explorer"

export interface DemoUser {
  email: string
  role: DemoUserRole
  id: string
  name: string
}

// Demo user data
const demoUsers: Record<string, DemoUser> = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
    name: "Alex Admin",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
    name: "Sam Scooper",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
    name: "Emma Explorer",
  },
}

// Client-side functions
export function setDemoUser(email: string): void {
  if (typeof window !== "undefined") {
    try {
      // Set in localStorage
      localStorage.setItem("conedex_demo_user", email)

      // Set cookie with SameSite=Lax to work across tabs
      document.cookie = `conedex_demo_user=${email}; path=/; max-age=86400; SameSite=Lax`

      // Dispatch storage event to notify other tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "conedex_demo_user",
          newValue: email,
        }),
      )
    } catch (error) {
      console.error("Error setting demo user:", error)
    }
  }
}

export function getDemoUser(): DemoUser | null {
  if (typeof window === "undefined") {
    return null
  }

  try {
    // Try localStorage first
    let email = localStorage.getItem("conedex_demo_user")

    // If not in localStorage, try cookies
    if (!email) {
      const cookies = document.cookie.split(";")
      const demoUserCookie = cookies.find((cookie) => cookie.trim().startsWith("conedex_demo_user="))
      if (demoUserCookie) {
        email = demoUserCookie.split("=")[1].trim()
        // Sync with localStorage
        localStorage.setItem("conedex_demo_user", email)
      }
    }

    return email ? demoUsers[email] || null : null
  } catch (error) {
    console.error("Error getting demo user:", error)
    return null
  }
}

export function clearDemoUser(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem("conedex_demo_user")
      document.cookie = "conedex_demo_user=; path=/; max-age=0; SameSite=Lax"

      // Dispatch storage event to notify other tabs
      window.dispatchEvent(
        new StorageEvent("storage", {
          key: "conedex_demo_user",
          oldValue: "some-value",
          newValue: null,
        }),
      )
    } catch (error) {
      console.error("Error clearing demo user:", error)
    }
  }
}

// Server-side functions remain the same
// These are imported from 'next/headers' at the top level in server components

import { signIn } from "./auth-compat"

export async function loginAsAdmin() {
  const password = process.env.DEMO_ADMIN_PASSWORD || "admin-password"
  return signIn("admin@conedex.com", password)
}

export async function loginAsExplorer() {
  const password = process.env.DEMO_EXPLORER_PASSWORD || "explorer-password"
  return signIn("explorer@conedex.com", password)
}

export async function loginAsShopOwner() {
  const password = process.env.DEMO_SHOPOWNER_PASSWORD || "shopowner-password"
  return signIn("shopowner@conedex.com", password)
}
