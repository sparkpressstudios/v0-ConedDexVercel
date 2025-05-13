import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import webpush from "web-push"
import { cookies } from "next/headers"

export async function POST(request: Request) {
  try {
    const { subscription, userId } = await request.json()

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      `mailto:${process.env.SENDGRID_FROM_EMAIL || "noreply@conedex.com"}`,
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
      process.env.VAPID_PRIVATE_KEY!,
    )

    const cookieStore = cookies()
    const supabase = createServerClient(cookieStore)

    // Get the current session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const loggedInUserId = session.user.id
    const subscriptionData = await request.json()

    if (!subscriptionData || !subscriptionData.endpoint) {
      return NextResponse.json({ error: "Invalid subscription data" }, { status: 400 })
    }

    // Store the subscription in the database
    const { data, error } = await supabase.from("push_subscriptions").upsert(
      {
        user_id: loggedInUserId,
        endpoint: subscriptionData.endpoint,
        subscription: subscriptionData,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id, endpoint",
      },
    )

    if (error) {
      console.error("Error saving subscription:", error)
      return NextResponse.json({ error: "Failed to save subscription" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in push subscription:", error)
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 })
  }
}
