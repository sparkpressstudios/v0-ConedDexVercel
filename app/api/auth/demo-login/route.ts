import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Define demo users with their roles
const DEMO_USERS = {
  "admin@conedex.app": {
    password: process.env.DEMO_ADMIN_PASSWORD || "admin123", // Better to use env var
    role: "admin",
  },
  "explorer@conedex.app": {
    password: process.env.DEMO_EXPLORER_PASSWORD || "explorer123",
    role: "explorer",
  },
  "shopowner@conedex.app": {
    password: process.env.DEMO_SHOPOWNER_PASSWORD || "shopowner123",
    role: "shop_owner",
  },
}

export async function POST(request: Request) {
  try {
    const requestUrl = new URL(request.url)
    const { email, password } = await request.json()

    // Check if this is a demo email
    const demoUser = DEMO_USERS[email as keyof typeof DEMO_USERS]

    if (!demoUser || demoUser.password !== password) {
      return NextResponse.json({ error: "Invalid demo credentials" }, { status: 401 })
    }

    // Create a custom session for the demo user
    const supabase = createServerClient()

    // Get the user ID from the database
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single()

    if (userError || !userData) {
      console.error("Demo user not found:", userError)
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    // Create a custom admin authorization cookie
    const { data: sessionData, error } = await supabase.auth.admin.createSession({
      userId: userData.id,
      properties: {
        provider: "email",
        email: email,
      },
      attributes: {
        role: demoUser.role,
      },
    })

    if (error) {
      console.error("Session creation error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Return success response
    return NextResponse.json({ user: sessionData.user, session: sessionData.session }, { status: 200 })
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
