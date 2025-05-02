"use client"

import type { AppProps } from "next/app"
import { useState, useEffect } from "react"
import { createPagesClient } from "../lib/auth/pages-auth"
import type { Session } from "@supabase/supabase-js"

// Create a context for auth
import React from "react"

export const AuthContext = React.createContext<{
  session: Session | null
  loading: boolean
}>({
  session: null,
  loading: true,
})

function MyApp({ Component, pageProps }: AppProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createPagesClient()

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
