import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

/**
 * Gets the current session from the server
 */
export async function getSession() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const {
      data: { session },
    } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error("Error getting session:", error)
    return null
  }
}

/**
 * Gets the current user from the server
 */
export async function getUser() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const {
      data: { user },
    } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error("Error getting user:", error)
    return null
  }
}

/**
 * Gets the current user's profile from the server
 */
export async function getUserProfile() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })
    const user = await getUser()

    if (!user) {
      // Check for demo user
      const demoUser = getDemoUser()
      if (demoUser) {
        return {
          id: demoUser.id,
          username: demoUser.email.split("@")[0],
          full_name: demoUser.name,
          role: demoUser.role,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser.name.replace(" ", "")}`,
          bio: `This is a demo ${demoUser.role} account.`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          favorite_flavor:
            demoUser.role === "admin"
              ? "Rocky Road"
              : demoUser.role === "shop_owner"
                ? "Vanilla Bean"
                : "Mint Chocolate Chip",
        }
      }
      return null
    }

    const { data: profile, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

    if (error) {
      console.error("Error getting user profile:", error)
      // Return a minimal profile based on the user object
      return {
        id: user.id,
        username: user.email?.split("@")[0] || "user",
        full_name: user.email?.split("@")[0] || "User",
        role: "explorer",
        avatar_url: null,
      }
    }

    return profile
  } catch (error) {
    console.error("Error getting user profile:", error)
    return null
  }
}

/**
 * Gets the current user's role from the server
 */
export async function getUserRole(): Promise<string | null> {
  try {
    // First check for demo user
    const demoRole = getDemoUserRole()
    if (demoRole) {
      return demoRole
    }

    const profile = await getUserProfile()
    return profile?.role || "explorer"
  } catch (error) {
    console.error("Error getting user role:", error)
    return "explorer" // Default to explorer role
  }
}

/**
 * Checks if the current user has the specified role
 */
export async function hasRole(role: string | string[]): Promise<boolean> {
  try {
    const userRole = await getUserRole()

    if (!userRole) {
      return false
    }

    if (Array.isArray(role)) {
      return role.includes(userRole)
    }

    return userRole === role
  } catch (error) {
    console.error("Error checking user role:", error)
    return false
  }
}

/**
 * Gets the demo user from cookies if available
 */
export function getDemoUser() {
  try {
    const cookieStore = cookies()
    const demoUserEmail = cookieStore.get("conedex_demo_user")?.value

    if (!demoUserEmail) {
      return null
    }

    // Demo user data
    const demoUsers: Record<string, any> = {
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

    return demoUsers[demoUserEmail as keyof typeof demoUsers] || null
  } catch (error) {
    console.error("Error getting demo user:", error)
    return null
  }
}

/**
 * Gets the current user's role from cookies if it's a demo user
 */
export function getDemoUserRole(): string | null {
  try {
    const demoUser = getDemoUser()
    return demoUser?.role || null
  } catch (error) {
    console.error("Error getting demo user role:", error)
    return null
  }
}

/**
 * Gets the current user's role from either auth or demo cookies
 */
export async function getCurrentRole(): Promise<string> {
  try {
    // First check for demo user
    const demoRole = getDemoUserRole()
    if (demoRole) {
      return demoRole
    }

    // Then check for authenticated user
    const authRole = await getUserRole()
    return authRole || "explorer" // Default to explorer if no role found
  } catch (error) {
    console.error("Error getting current role:", error)
    return "explorer" // Default to explorer role
  }
}
