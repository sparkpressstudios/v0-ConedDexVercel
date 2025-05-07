import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// Demo user credentials
const DEMO_USERS = {
  "admin@conedex.app": process.env.DEMO_ADMIN_PASSWORD || "admin-password",
  "shopowner@conedex.app": process.env.DEMO_SHOPOWNER_PASSWORD || "shopowner-password",
  "explorer@conedex.app": process.env.DEMO_EXPLORER_PASSWORD || "explorer-password",
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    // Enhanced logging for debugging
    console.log(`Login attempt for: ${email}`)

    if (!email || !password) {
      console.log("Missing email or password")
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

    // Check if this is a demo user
    if (Object.keys(DEMO_USERS).includes(email)) {
      console.log(`Demo user login attempt: ${email}`)

      // For demo users, we'll use direct password authentication
      // This ensures they can access the real dashboard
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Demo login error:", error)

        // If the user doesn't exist in Supabase, create them
        if (error.message.includes("Invalid login credentials")) {
          console.log(`Creating demo user: ${email}`)

          // Create the user with the demo password
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                role: email.includes("admin") ? "admin" : email.includes("shopowner") ? "shop_owner" : "explorer",
                name: email.includes("admin")
                  ? "Alex Admin"
                  : email.includes("shopowner")
                    ? "Sam Scooper"
                    : "Emma Explorer",
              },
            },
          })

          if (signUpError) {
            console.error("Failed to create demo user:", signUpError)
            return NextResponse.json(
              {
                error: "Failed to create demo user",
                details: signUpError.message,
                code: "DEMO_USER_CREATION_FAILED",
              },
              { status: 500 },
            )
          }

          // Now try to sign in again
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          })

          if (signInError) {
            console.error("Failed to sign in after creating demo user:", signInError)
            return NextResponse.json(
              {
                error: "Authentication failed after user creation",
                details: signInError.message,
                code: "AUTH_FAILED_AFTER_CREATION",
              },
              { status: 401 },
            )
          }

          // Successfully created and signed in
          console.log(`Successfully created and signed in demo user: ${email}`)
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }

        return NextResponse.json(
          {
            error: "Authentication failed",
            details: error.message,
            code: "AUTH_FAILED",
          },
          { status: 401 },
        )
      }

      console.log(`Demo user successfully authenticated: ${email}`)
      return NextResponse.redirect(new URL("/dashboard", request.url))
    } else {
      // For regular users, use normal authentication
      console.log("Regular user login attempt")
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error("Regular login error:", error)
        return NextResponse.json(
          {
            error: "Authentication failed",
            details: error.message,
            code: "AUTH_FAILED",
          },
          { status: 401 },
        )
      }

      console.log("Regular user successfully authenticated")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  } catch (error: any) {
    console.error("Unexpected login error:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
        details: error?.message || "Unknown error",
        code: "UNEXPECTED_ERROR",
      },
      { status: 500 },
    )
  }
}
