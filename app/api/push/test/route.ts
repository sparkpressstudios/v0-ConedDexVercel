import { type NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/auth/session"
import { sendPushNotificationToUser } from "@/lib/services/push-notification-service"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id

    // Send a test notification
    await sendPushNotificationToUser(userId, {
      title: "ConeDex Test Notification",
      body: "This is a test notification from ConeDex!",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/notification-badge.png",
      data: {
        url: "/dashboard",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error sending test notification:", error)
    return NextResponse.json({ error: "Failed to send test notification" }, { status: 500 })
  }
}
