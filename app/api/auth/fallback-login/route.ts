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

    // Set demo user cookie directly
    cookies().set("conedex_demo_user", email, {
      path: "/",
      maxAge: 86400, // 24 hours in seconds
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
    })

    return NextResponse.json({
      success: true,
      message: "Fallback login successful",
      role: role,
    })
  } catch (error: any) {
    console.error("Fallback login error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
