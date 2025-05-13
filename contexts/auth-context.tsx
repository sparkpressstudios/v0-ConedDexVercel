"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client-browser"
import { useToast } from "@/hooks/use-toast"
import { getDemoUser, clearDemoUser } from "@/lib/auth/demo-auth"

type User = {
  id: string
  email: string
  role?: string
  name?: string
  avatar_url?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  // Refresh user data from the server
  const refreshUser = useCallback(async () => {
    try {
      // First check for demo user
      const demoUser = getDemoUser()
      if (demoUser) {
        console.log("Found demo user:", demoUser.email)
        setUser({
          id: demoUser.id,
          email: demoUser.email,
          role: demoUser.role,
          name: demoUser.name,
        })
        return
      }

      // If not a demo user, check Supabase auth
      const {
        data: { user: authUser },
        error,
      } = await supabase.auth.getUser()

      if (error || !authUser) {
        setUser(null)
        return
      }

      // Get additional user data from the database
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("role, name, avatar_url")
        .eq("id", authUser.id)
        .single()

      if (userError) {
        console.error("Error fetching user data:", userError)
      }

      setUser({
        id: authUser.id,
        email: authUser.email || "",
        role: userData?.role || "user",
        name: userData?.name || authUser.user_metadata?.name,
        avatar_url: userData?.avatar_url || authUser.user_metadata?.avatar_url,
      })
    } catch (error) {
      console.error("Error refreshing user:", error)
      setUser(null)
    }
  }, [supabase])

  // Check auth status on mount and auth state changes
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        await refreshUser()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        await refreshUser()
      } else if (event === "SIGNED_OUT") {
        setUser(null)
      }
    })

    // Listen for storage events (for demo user changes)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "conedex_demo_user") {
        refreshUser()
      }
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [supabase, refreshUser])

  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true)

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        return { success: false, error: error.message }
      }

      await refreshUser()
      return { success: true }
    } catch (error: any) {
      return { success: false, error: error.message || "An error occurred during sign in" }
    } finally {
      setIsLoading(false)
    }
  }

  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true)

      // Clear demo user if present
      clearDemoUser()

      // Also sign out from Supabase
      await supabase.auth.signOut()

      setUser(null)
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error signing out",
        description: "An error occurred while signing out. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signIn,
        signOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedRoute(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading && !user) {
        router.push("/login")
      }
    }, [user, isLoading, router])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!user) {
      return null
    }

    return <Component {...props} />
  }
}

// Higher-order component for role-based access control
export function withRole<P extends object>(Component: React.ComponentType<P>, allowedRoles: string[]) {
  return function RoleProtectedRoute(props: P) {
    const { user, isLoading } = useAuth()
    const router = useRouter()

    useEffect(() => {
      if (!isLoading) {
        if (!user) {
          router.push("/login")
        } else if (user.role && !allowedRoles.includes(user.role)) {
          router.push("/unauthorized")
        }
      }
    }, [user, isLoading, router])

    if (isLoading) {
      return <div>Loading...</div>
    }

    if (!user || (user.role && !allowedRoles.includes(user.role))) {
      return null
    }

    return <Component {...props} />
  }
}
