import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shopId, shopName, flavorId, flavorName, flavorImage, flavorDescription } = await request.json()

    if (!shopId || !shopName || !flavorId || !flavorName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = createClient()

    // Verify the user owns this shop
    const { data: shop, error: shopError } = await supabase
      .from("shops")
      .select("id")
      .eq("id", shopId)
      .eq("owner_id", session.user.id)
      .single()

    if (shopError || !shop) {
      return NextResponse.json({ error: "Unauthorized to send notifications for this shop" }, { status: 403 })
    }

    // Get all followers of the shop
    const { data: followers, error: followersError } = await supabase
      .from("shop_followers")
      .select("user_id")
      .eq("shop_id", shopId)

    if (followersError) {
      return NextResponse.json({ error: "Failed to retrieve shop followers" }, { status: 500 })
    }

    if (!followers || followers.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No followers to notify",
      })
    }

    // Import web-push dynamically to avoid server-side issues
    const webPush = await import("web-push")

    // Initialize web-push with VAPID keys
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""

    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json({ error: "VAPID keys are not set" }, { status: 500 })
    }

    webPush.default.setVapidDetails("mailto:notifications@conedex.com", vapidPublicKey, vapidPrivateKey)

    // Prepare notification payload
    const notificationPayload = {
      title: `New Flavor at ${shopName}`,
      body: `Try their new ${flavorName} flavor!`,
      icon: flavorImage || "/icons/icon-192x192.png",
      badge: "/icons/notification-badge.png",
      image: flavorImage,
      data: {
        url: `/dashboard/shops/${shopId}/flavors/${flavorId}`,
        shopId,
        flavorId,
      },
    }

    // For each follower, get their push subscriptions and send notifications
    let notifiedUsers = 0

    for (const follower of followers) {
      // Get user's push subscriptions
      const { data: subscriptions, error: subError } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", follower.user_id)

      if (subError || !subscriptions || subscriptions.length === 0) {
        continue
      }

      // Send notification to all user's devices
      for (const sub of subscriptions) {
        try {
          const parsedSubscription = JSON.parse(sub.subscription)
          await webPush.default.sendNotification(parsedSubscription, JSON.stringify(notificationPayload))
          notifiedUsers++
        } catch (error) {
          console.error("Error sending push notification:", error)
          // Continue with other subscriptions even if one fails
        }
      }

      // Also create in-app notification
      await supabase.from("notifications").insert({
        user_id: follower.user_id,
        type: "new_flavor",
        title: `New flavor at ${shopName}`,
        content: `Try their new ${flavorName} flavor!`,
        is_read: false,
        data: JSON.stringify({
          shop_id: shopId,
          flavor_id: flavorId,
          flavor_name: flavorName,
          flavor_image: flavorImage,
        }),
        created_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      success: true,
      notifiedUsers,
    })
  } catch (error) {
    console.error("Error sending push notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
