"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client-browser"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any
  profile: any
  signOut?: () => Promise<void>
  loading: boolean
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  isAuthenticated: false,
  error: null,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Create the Supabase client
  const supabase = createClient()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      setError(null)

      try {
        // Check for demo user in cookies
        const demoUserEmail = document.cookie
          .split("; ")
          .find((row) => row.startsWith("conedex_demo_user="))
          ?.split("=")[1]

        if (demoUserEmail) {
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

          const demoUser = demoUsers[demoUserEmail as keyof typeof demoUsers]

          if (demoUser) {
            setUser({
              id: demoUser.id,
              email: demoUser.email,
            })
            setProfile({
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
            })
            setIsAuthenticated(true)
            setLoading(false)
            return
          }
        }

        // Get current user
        const { data, error } = await supabase.auth.getUser()

        if (error) {
          throw error
        }

        const currentUser = data?.user

        if (currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)

          // Get user profile
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", currentUser.id)
            .single()

          if (profileError) {
            console.warn("Error fetching profile:", profileError)
            // Create a basic profile
            setProfile({
              id: currentUser.id,
              username: currentUser.email?.split("@")[0] || "User",
              full_name: currentUser.email?.split("@")[0] || "User",
              role: "explorer",
              avatar_url: null,
            })
          } else {
            setProfile(profileData)
          }
        } else {
          setUser(null)
          setProfile(null)
          setIsAuthenticated(false)
        }
      } catch (error: any) {
        console.error("Error fetching user:", error)
        setError(error.message || "Failed to authenticate")
        setUser(null)
        setProfile(null)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }

    // Call fetch user on initial load
    fetchUser()

    // Set up auth state listener
    let authListener: { subscription?: { unsubscribe: () => void } } = {}

    try {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          setUser(session.user)
          setIsAuthenticated(true)

          // Get user profile
          try {
            const { data: profileData, error: profileError } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single()

            if (profileError) {
              console.warn("Error fetching profile:", profileError)
              // Create a basic profile
              setProfile({
                id: session.user.id,
                username: session.user.email?.split("@")[0] || "User",
                full_name: session.user.email?.split("@")[0] || "User",
                role: "explorer",
                avatar_url: null,
              })
            } else {
              setProfile(profileData)
            }
          } catch (error) {
            console.error("Error fetching profile:", error)
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null)
          setProfile(null)
          setIsAuthenticated(false)
        }
      })

      authListener = data
    } catch (error) {
      console.error("Error setting up auth listener:", error)
    }

    return () => {
      authListener?.subscription?.unsubscribe()
    }
  }, [supabase])

  const refreshProfile = async () => {
    if (!supabase || !user) return
    try {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      if (error) throw error
      setProfile(data)
    } catch (error) {
      console.error("Error refreshing profile:", error)
    }
  }

  const signOut = async () => {
    try {
      // Check for demo user cookie
      const demoUserCookie = document.cookie.split("; ").find((row) => row.startsWith("conedex_demo_user="))

      if (demoUserCookie) {
        // Clear the demo user cookie
        document.cookie = "conedex_demo_user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
        setUser(null)
        setProfile(null)
        setIsAuthenticated(false)
        router.push("/")
        return
      }

      // Regular sign out
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      setIsAuthenticated(false)
      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        signOut,
        loading,
        refreshProfile,
        isAuthenticated,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
