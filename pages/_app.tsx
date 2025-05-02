"use client"

import type { AppProps } from "next/app"
import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import type { Session } from "@supabase/supabase-js"
import React from "react"
import "../app/globals.css"

// Create a context for auth that doesn't depend on next/headers
export const AuthContext = React.createContext<{
  session: Session | null
  loading: boolean
}>({
  session: null,
  loading: true,
})

// Create a Supabase client for the browser
const createBrowserClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

function MyApp({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient()

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading }}>
      <Component {...pageProps} />
    </AuthContext.Provider>
  )
}

export default MyApp
