import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { EmailService } from "@/lib/services/email-service"

export async function POST(request: Request) {
  try {
    const { email, password, username, fullName, role } = await request.json()

    // Create a Supabase client
    const supabase = createRouteHandlerClient({ cookies })

    // Step 1: Create the user account with emailConfirm: false to skip email verification
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: fullName,
          role,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        // Require email verification for proper security
        emailConfirm: true,
      },
    })

    if (authError) {
      console.error("Auth error:", authError)
      return NextResponse.json({ message: authError.message || "Failed to create user account" }, { status: 400 })
    }

    if (!authData.user?.id) {
      return NextResponse.json({ message: "User creation failed. Please try again." }, { status: 400 })
    }

    // Step 2: Create the profile
    const { error: profileError } = await supabase.from("profiles").insert({
      id: authData.user.id,
      username,
      full_name: fullName,
      role,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      email_verified: false, // Mark as not verified yet
    })

    if (profileError) {
      console.error("Profile creation error:", profileError)
      return NextResponse.json(
        {
          message: "Account created but profile setup failed. Please contact support.",
          user: authData.user,
          profileError: profileError.message,
        },
        { status: 201 },
      )
    }

    // Step 3: Send a welcome email manually (since we're not using Supabase's automatic verification)
    try {
      const emailService = EmailService.getInstance()
      await emailService.sendWelcomeEmail(email, fullName || username)

      // We're already sending the verification email with emailConfirm: true
      // No need to send another one, but we can log that it's happening
      console.log("Verification email sent to:", email)
    } catch (emailError) {
      console.error("Email sending error:", emailError)
      // Don't fail the signup if just the email fails
    }

    // Step 4: Sign in the user immediately
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      console.error("Sign in error:", signInError)
      // Don't fail the signup if just the sign-in fails
      // The user can still sign in manually
    }

    // Return success response
    return NextResponse.json(
      {
        message: "Account created successfully! Please check your email to verify your account before logging in.",
        user: authData.user,
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ message: "An unexpected error occurred" }, { status: 500 })
  }
}
