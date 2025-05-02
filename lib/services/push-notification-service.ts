import { createClient } from "@/lib/supabase/client"
import webPush from "web-push"

export interface PushSubscription {
  endpoint: string
  expirationTime: number | null
  keys: {
    p256dh: string
    auth: string
  }
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private supabase = createClient()

  private constructor() {
    // Initialize web-push with VAPID keys
    if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webPush.setVapidDetails(
        "mailto:support@conedex.com",
        process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY,
      )
    } else {
      console.error("VAPID keys are not set")
    }
  }

  public static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  public async subscribeToPushNotifications(subscription: PushSubscription): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) {
        throw new Error("User not authenticated")
      }

      const { error } = await this.supabase.from("push_subscriptions").insert({
        user_id: user.user.id,
        endpoint: subscription.endpoint,
        subscription: JSON.stringify(subscription),
      })

      if (error) {
        // If it's a duplicate, we can ignore it
        if (error.code === "23505") {
          // Update the subscription instead
          const { error: updateError } = await this.supabase
            .from("push_subscriptions")
            .update({
              subscription: JSON.stringify(subscription),
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.user.id)
            .eq("endpoint", subscription.endpoint)

          if (updateError) {
            console.error("Error updating push subscription:", updateError)
            return false
          }
          return true
        }
        console.error("Error saving push subscription:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in subscribeToPushNotifications:", error)
      return false
    }
  }

  public async unsubscribeFromPushNotifications(endpoint: string): Promise<boolean> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) {
        throw new Error("User not authenticated")
      }

      const { error } = await this.supabase
        .from("push_subscriptions")
        .delete()
        .eq("user_id", user.user.id)
        .eq("endpoint", endpoint)

      if (error) {
        console.error("Error deleting push subscription:", error)
        return false
      }

      return true
    } catch (error) {
      console.error("Error in unsubscribeFromPushNotifications:", error)
      return false
    }
  }

  public async getUserSubscriptions(): Promise<PushSubscription[]> {
    try {
      const { data: user } = await this.supabase.auth.getUser()
      if (!user.user) {
        return []
      }

      const { data, error } = await this.supabase
        .from("push_subscriptions")
        .select("subscription")
        .eq("user_id", user.user.id)

      if (error) {
        console.error("Error fetching push subscriptions:", error)
        return []
      }

      return data.map((item) => JSON.parse(item.subscription))
    } catch (error) {
      console.error("Error in getUserSubscriptions:", error)
      return []
    }
  }

  public async isSubscribed(): Promise<boolean> {
    const subscriptions = await this.getUserSubscriptions()
    return subscriptions.length > 0
  }
}

export const pushNotificationService = PushNotificationService.getInstance()

export async function sendPushNotificationToUser(
  userId: string,
  title: string,
  body: string,
  icon?: string,
  data?: Record<string, any>,
): Promise<boolean> {
  try {
    const supabase = createClient()

    // Get user's push subscriptions
    const { data, error } = await supabase.from("push_subscriptions").select("subscription").eq("user_id", userId)

    if (error) {
      console.error("Error fetching push subscriptions:", error)
      return false
    }

    if (!data || data.length === 0) {
      console.log(`No push subscriptions found for user ${userId}`)
      return false
    }

    // Initialize web-push with VAPID keys
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error("VAPID keys are not set")
      return false
    }

    webPush.setVapidDetails(
      "mailto:support@conedex.com",
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    )

    // Send push notification to all user's subscriptions
    const notificationPayload = JSON.stringify({
      title,
      body,
      icon: icon || "/icons/notification-badge.png",
      data: data || {},
      badge: "/icons/notification-badge.png",
      timestamp: Date.now(),
    })

    const results = await Promise.allSettled(
      data.map(async (sub) => {
        try {
          const subscription = JSON.parse(sub.subscription)
          await webPush.sendNotification(subscription, notificationPayload)
          return true
        } catch (error) {
          console.error("Error sending push notification:", error)

          // If subscription is expired or invalid, remove it
          if (error.statusCode === 404 || error.statusCode === 410) {
            try {
              const parsedSub = JSON.parse(sub.subscription)
              await supabase
                .from("push_subscriptions")
                .delete()
                .eq("user_id", userId)
                .eq("endpoint", parsedSub.endpoint)

              console.log(`Removed invalid subscription for user ${userId}`)
            } catch (deleteError) {
              console.error("Error removing invalid subscription:", deleteError)
            }
          }

          return false
        }
      }),
    )

    // Check if at least one notification was sent successfully
    return results.some((result) => result.status === "fulfilled" && result.value === true)
  } catch (error) {
    console.error("Error in sendPushNotificationToUser:", error)
    return false
  }
}
