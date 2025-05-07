import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Handle POST requests for form submissions
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    if (!email || !password) {
      return NextResponse.json(
        {
          error: "Email and password are required",
          details: "Both email and password fields must be provided",
        },
        { status: 400 },
      )
    }

    // Create Supabase client
    const supabase = createClient()

    // Authenticate the user
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      console.error("Login error:", error)
      return NextResponse.json(
        {
          error: "Authentication failed",
          details: error.message,
        },
        { status: 401 },
      )
    }

    // Successful login
    return NextResponse.redirect(new URL("/dashboard", request.url))
  } catch (error: any) {
    console.error("Unexpected login error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}

// Handle GET requests for direct access
export async function GET() {
  // Redirect GET requests to the login page
  return NextResponse.redirect(new URL("/login", "http://localhost:3000"))
}

// Handle OPTIONS requests for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  })
}
