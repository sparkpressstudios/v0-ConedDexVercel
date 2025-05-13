import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { setDemoUser } from "@/lib/auth/server-demo-auth"

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

    // Set demo user in cookie
    await setDemoUser(email)

    // Sign in with Supabase
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Demo login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
