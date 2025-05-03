// This file is for server-side usage in the App Router ONLY
// DO NOT import this file in the pages/ directory

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { isPagesRouter, getSafeCookies } from "@/lib/utils/runtime-detection"

export function createServerClient() {
  try {
    if (isPagesRouter()) {
      // We're in the Pages Router, use direct client creation
      return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        },
      )
    }

    // We're in the App Router, use cookies
    const cookieStore = getSafeCookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (e) {
    console.error("Error creating server client:", e)
    // Fallback to direct client creation
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  }
}

// Add the missing createClient export
export function createClient() {
  try {
    if (isPagesRouter()) {
      // We're in the Pages Router, use direct client creation
      return createSupabaseClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      )
    }

    // We're in the App Router, use cookies
    const cookieStore = getSafeCookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (e) {
    console.error("Error creating client:", e)
    // Fallback to direct client creation
    return createSupabaseClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )
  }
}
