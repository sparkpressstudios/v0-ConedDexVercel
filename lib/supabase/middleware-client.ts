import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import type { NextRequest, NextResponse } from "next/server"
import type { Database } from "@/lib/database.types"

export function createMiddlewareSupabaseClient(req: NextRequest, res: NextResponse) {
  return createMiddlewareClient<Database>({ req, res })
}
