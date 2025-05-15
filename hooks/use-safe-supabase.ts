"use client"

import { useSupabase } from "@/components/providers/supabase-provider"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

export function useSafeSupabase() {
  const supabaseContext = useSupabase ? useSupabase() : null
  const [fallbackClient, setFallbackClient] = useState<any>(supabaseContext ? null : { supabase: createClient() })

  useEffect(() => {
    if (!supabaseContext) {
      // Create a fallback client if the context is not available
      const client = createClient()
      setFallbackClient({ supabase: client })
    }
  }, [supabaseContext])

  return supabaseContext || fallbackClient || { supabase: null }
}
