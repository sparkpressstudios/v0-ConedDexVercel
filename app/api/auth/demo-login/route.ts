import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { role = "explorer" } = await request.json()

    let email = "explorer@conedex.app"
    let password = process.env.DEMO_EXPLORER_PASSWORD || "demo123"

    if (role === "shopowner") {
      email = "shopowner@conedex.app"
      password = process.env.DEMO_SHOPOWNER_PASSWORD || "demo123"
    } else if (role === "admin") {
      email = "admin@conedex.app"
      password = process.env.DEMO_ADMIN_PASSWORD || "demo123"
    }

    // Set demo user cookie
    cookies().set("conedex_demo_user", email, {
      path: "/",
      maxAge: 86400, // 24 hours in seconds
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
