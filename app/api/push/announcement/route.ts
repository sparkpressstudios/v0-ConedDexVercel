import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { shopId, shopName, announcementId, title, content } = await request.json()

    if (!shopId || !shopName || !announcementId || !title) {
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

    // Prepare notification payload
    const notificationPayload = {
      title: `${shopName}: ${title}`,
      body: content.length > 100 ? content.substring(0, 97) + "..." : content,
      icon: "/icons/icon-192x192.png",
      badge: "/icons/notification-badge.png",
      data: {
        url: `/dashboard/shops/${shopId}/announcements/${announcementId}`,
        shopId,
        announcementId,
      },
    }

    // Send notifications to all followers
    const sendPromises = followers.map((follower) => sendPushNotificationToUser(follower.user_id, notificationPayload))

    await Promise.allSettled(sendPromises)

    // Also create in-app notifications
    const notificationsToInsert = followers.map((follower) => ({
      user_id: follower.user_id,
      type: "shop_announcement",
      title: `New announcement from ${shopName}`,
      content: title,
      is_read: false,
      data: JSON.stringify({
        shop_id: shopId,
        announcement_id: announcementId,
      }),
      created_at: new Date().toISOString(),
    }))

    const { error: notificationError } = await supabase.from("notifications").insert(notificationsToInsert)

    if (notificationError) {
      console.error("Error creating in-app notifications:", notificationError)
    }

    return NextResponse.json({
      success: true,
      notifiedUsers: followers.length,
    })
  } catch (error) {
    console.error("Error sending push notifications:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Helper function to send push notification to a specific user
async function sendPushNotificationToUser(userId: string, payload: any): Promise<void> {
  const { createClient } = await import("@/lib/supabase/server")
  const supabase = createClient()

  try {
    // Get user's push subscriptions
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("subscription")
      .eq("user_id", userId)

    if (error) throw error

    if (!subscriptions || subscriptions.length === 0) {
      return
    }

    // Import web-push dynamically to avoid server-side issues
    const webPush = await import("web-push")

    // Initialize web-push with VAPID keys
    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ""
    const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY || ""

    if (!vapidPublicKey || !vapidPrivateKey) {
      throw new Error("VAPID keys are not set")
    }

    webPush.default.setVapidDetails("mailto:notifications@conedex.com", vapidPublicKey, vapidPrivateKey)

    // Send notification to all user's devices
    const sendPromises = subscriptions.map((sub) => {
      try {
        const parsedSubscription = JSON.parse(sub.subscription)
        return webPush.default.sendNotification(parsedSubscription, JSON.stringify(payload))
      } catch (error) {
        console.error("Error parsing subscription or sending notification:", error)
        return Promise.resolve()
      }
    })

    await Promise.allSettled(sendPromises)
  } catch (error) {
    console.error("Error sending push notification to user:", error)
  }
}
