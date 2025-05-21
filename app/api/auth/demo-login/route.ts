import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { role = "explorer" } = await request.json()

    let email = "explorer@conedex.app"

    if (role === "shopowner") {
      email = "shopowner@conedex.app"
    } else if (role === "admin") {
      email = "admin@conedex.app"
    }

    // Set demo user cookie with a long expiration (30 days)
    cookies().set("conedex_demo_user", email, {
      path: "/",
      maxAge: 2592000, // 30 days in seconds
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Demo login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
