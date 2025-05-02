// This file is for server-side usage in the App Router ONLY
// DO NOT import this file in the Pages Router or client components

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export function createServerClient() {
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (e) {
    console.error("Error creating server client:", e)
    throw new Error(
      "Failed to create server client. This must be used in a Server Component or API Route in the App Router.",
    )
  }
}

// Add the missing createClient export
export function createClient() {
  try {
    const cookieStore = cookies()
    return createServerComponentClient<Database>({ cookies: () => cookieStore })
  } catch (e) {
    console.error("Error creating client:", e)
    throw new Error("Failed to create client. This must be used in a Server Component or API Route in the App Router.")
  }
}
