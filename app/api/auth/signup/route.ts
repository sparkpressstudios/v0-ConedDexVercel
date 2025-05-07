import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, role } = await request.json()

    if (!email || !password || !name || !role) {
      return NextResponse.json(
        {
          error: "Missing required fields",
          details: "Email, password, name, and role are required",
        },
        { status: 400 },
      )
    }

    // Validate role
    const validRoles = ["explorer", "shop_owner"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role",
          details: "Role must be one of: explorer, shop_owner",
        },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Create the user
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          role,
        },
      },
    })

    if (error) {
      console.error("Signup error:", error)
      return NextResponse.json(
        {
          error: "Failed to create account",
          details: error.message,
        },
        { status: 400 },
      )
    }

    // Successfully created user
    return NextResponse.json({
      success: true,
      message: "Account created successfully",
      userId: data.user?.id,
    })
  } catch (error: any) {
    console.error("Unexpected signup error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
