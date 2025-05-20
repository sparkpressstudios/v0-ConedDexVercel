import { NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Get session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession()

    if (sessionError) {
      return NextResponse.json(
        {
          error: "Session error",
          details: sessionError.message,
          code: sessionError.code,
        },
        { status: 500 },
      )
    }

    // If no session, check for demo user
    if (!sessionData.session) {
      const demoUserCookie = cookies().get("conedex_demo_user")

      if (demoUserCookie) {
        return NextResponse.json({
          status: "demo_user",
          demoUser: demoUserCookie.value,
          message: "Using demo user authentication",
        })
      }

      return NextResponse.json({
        status: "no_auth",
        message: "No authentication found",
      })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", sessionData.session.user.id)
      .single()

    if (profileError) {
      return NextResponse.json(
        {
          error: "Profile error",
          details: profileError.message,
          code: profileError.code,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      status: "authenticated",
      user: {
        id: sessionData.session.user.id,
        email: sessionData.session.user.email,
      },
      profile: {
        username: profile?.username,
        role: profile?.role,
      },
      env: {
        NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Not set",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Not set",
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
