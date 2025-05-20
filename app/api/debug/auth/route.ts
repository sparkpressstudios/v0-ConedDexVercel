import { NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    // Get cookies
    const cookieStore = cookies()
    const demoUserCookie = cookieStore.get("conedex_demo_user")?.value

    // Create Supabase client
    const supabase = createClient()

    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    // Get user
    const { data: userData, error: userError } = await supabase.auth.getUser()

    // Return debug info
    return NextResponse.json({
      cookies: {
        demoUser: demoUserCookie || null,
      },
      session: {
        data: sessionData,
        error: sessionError ? sessionError.message : null,
      },
      user: {
        data: userData,
        error: userError ? userError.message : null,
      },
      env: {
        hasExplorerPassword: !!process.env.DEMO_EXPLORER_PASSWORD,
        hasShopownerPassword: !!process.env.DEMO_SHOPOWNER_PASSWORD,
        hasAdminPassword: !!process.env.DEMO_ADMIN_PASSWORD,
        nodeEnv: process.env.NODE_ENV,
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error.message || "Unknown error",
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
