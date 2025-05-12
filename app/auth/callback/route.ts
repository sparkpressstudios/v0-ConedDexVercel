import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Update the user's profile to mark email as verified
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      await supabase
        .from("profiles")
        .update({
          email_verified: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)
    }
  }

  // Redirect to the dashboard
  return NextResponse.redirect(new URL("/dashboard", request.url))
}
