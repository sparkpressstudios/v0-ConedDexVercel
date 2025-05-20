"use server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { EmailService } from "@/lib/services/email-service"

export async function forgotPassword(email: string, redirectUrl: string) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectUrl,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Password reset error:", error)
    return { success: false, error: error.message }
  }
}

export async function resendVerificationEmail(email: string, redirectUrl: string) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Resend verification error:", error)
    return { success: false, error: error.message }
  }
}

export async function validatePasswordResetToken(token: string) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    // This is just a validation, not the actual reset
    const { data, error } = await supabase.auth.getUser(token)

    if (error || !data.user) throw error || new Error("Invalid token")

    return { success: true, user: data.user }
  } catch (error: any) {
    console.error("Token validation error:", error)
    return { success: false, error: error.message }
  }
}

export async function resetPassword(password: string) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Password update error:", error)
    return { success: false, error: error.message }
  }
}

export async function updateUserEmailStatus(userId: string, verified: boolean) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        email_verified: verified,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (error) throw error

    return { success: true }
  } catch (error: any) {
    console.error("Profile update error:", error)
    return { success: false, error: error.message }
  }
}

export async function sendWelcomeEmail(email: string, name: string) {
  try {
    const emailService = EmailService.getInstance()
    await emailService.sendWelcomeEmail(email, name)
    return { success: true }
  } catch (error: any) {
    console.error("Welcome email error:", error)
    return { success: false, error: error.message }
  }
}
