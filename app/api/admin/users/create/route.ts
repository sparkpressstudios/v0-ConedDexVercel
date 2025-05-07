import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    // Create Supabase client
    const supabase = createClient()

    // Check if the current user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user metadata to check role
    const { data: userData } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (!userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    // Parse request body
    const { email, password, name, role, sendEmail } = await request.json()

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
    const validRoles = ["admin", "shop_owner", "explorer"]
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        {
          error: "Invalid role",
          details: "Role must be one of: admin, shop_owner, explorer",
        },
        { status: 400 },
      )
    }

    // Create the user using admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })

    if (error) {
      console.error("User creation error:", error)
      return NextResponse.json(
        {
          error: "Failed to create user",
          details: error.message,
        },
        { status: 400 },
      )
    }

    // If sendEmail is true, send welcome email
    if (sendEmail) {
      // This would typically call your email service
      console.log(`Would send welcome email to ${email}`)

      // For now, just log it
      // In a real implementation, you would use your email service here
    }

    // Successfully created user
    return NextResponse.json({
      success: true,
      message: "User created successfully",
      userId: data.user.id,
    })
  } catch (error: any) {
    console.error("Unexpected user creation error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error?.message || "Unknown error",
      },
      { status: 500 },
    )
  }
}
