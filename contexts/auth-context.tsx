"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

type AuthContextType = {
  user: any
  profile: any
  signOut?: () => Promise<void>
  loading: boolean
  refreshProfile: () => Promise<void>
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  refreshProfile: async () => {},
  isAuthenticated: false,
})

export const useAuth = () => useContext(AuthContext)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  // Check if we have the required environment variables
  const hasEnvVars =
    typeof window !== "undefined" &&
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const supabase = hasEnvVars ? createClient() : null

  useEffect(() => {
    if (!supabase) {
      console.error("Supabase client could not be initialized due to missing environment variables")
      setLoading(false)
      return
    }

    const fetchUser = async () => {
      setLoading(true)
      try {
        // Get current user
        const { data } = await supabase.auth.getUser()
        const currentUser = data?.user

        if (currentUser) {
          setUser(currentUser)
          setIsAuthenticated(true)

          // Get user profile
          const { data: profileData } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single()
          setProfile(profileData)
        } else {
          setUser(null)
          setProfile(null)
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error("Error fetching user:", error)
      } finally {
        setLoading(false)
      }
    }

    // Call fetch user on initial load
    fetchUser()

    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        setUser(session.user)
        setIsAuthenticated(true)

        // Get user profile
        const { data: profileData } = await supabase.from("profiles").select("*").eq("id", session.user.id).single()
        setProfile(profileData)
      } else if (event === "SIGNED_OUT") {
        setUser(null)
        setProfile(null)
        setIsAuthenticated(false)
      }
    })

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
    if (!supabase) return

    try {
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
