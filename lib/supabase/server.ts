"use server"

import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/database.types"

export async function createServerClient() {
  return createServerComponentClient<Database>({ cookies })
}

export async function createClient() {
  return createServerComponentClient<Database>({ cookies })
}
