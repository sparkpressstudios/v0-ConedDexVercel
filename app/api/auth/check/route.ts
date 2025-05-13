import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"

export async function GET() {
  const cookieStore = cookies()
  const supabase = createRouteHandlerClient({ cookies: () => cookieStore })

  // Check for demo user
  const demoUserCookie = cookieStore.get("conedex_demo_user")

  // Check for Supabase session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  return NextResponse.json({
    authenticated: !!session || !!demoUserCookie,
    demoUser: demoUserCookie ? demoUserCookie.value : null,
    session: session ? true : false,
  })
}
