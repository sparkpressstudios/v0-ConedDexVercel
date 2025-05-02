"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createPagesClient } from "@/lib/supabase/pages-client"
import { useRouter } from "next/router"

type User = {
  id: string
  email: string
  role?: string
}

type PagesAuthContextType = {
  user: User | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const PagesAuthContext = createContext<PagesAuthContextType | undefined>(undefined)

export function PagesAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const supabase = createPagesClient()

  useEffect(() => {
    // Check current session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user || null)
      } catch (error) {
        console.error("Error checking session:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) throw error
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/login")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return <PagesAuthContext.Provider value={{ user, isLoading, signIn, signOut }}>{children}</PagesAuthContext.Provider>
}

export function usePagesAuth() {
  const context = useContext(PagesAuthContext)
  if (context === undefined) {
    throw new Error("usePagesAuth must be used within a PagesAuthProvider")
  }
  return context
}
