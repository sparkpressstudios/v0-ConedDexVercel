import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, role } = await request.json()

    // Create a Supabase client with the service role key
    const supabase = createRouteHandlerClient({ cookies })

    // Step 1: Create the user account
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role,
        },
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ message: authError.message || "Failed to create user account" }, { status: 400 })
    }

    if (!authData.user?.id) {
      return NextResponse.json({ message: "User creation failed. Please try again." }, { status: 400 })
    }

    // Step 2: Create the profile using the admin client
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)

      // If profile creation fails, we should still return success
      // since the auth account was created successfully
      return NextResponse.json(
        {
          message: "Account created but profile setup failed. Please contact support.",
          user: authData.user,
          profileError: profileError.message,
        },
        { status: 201 },
      )
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Account created successfully!",
        user: authData.user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
