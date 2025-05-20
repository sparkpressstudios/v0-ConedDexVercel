"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export type NotificationType =
  | "quest_joined"
  | "quest_completed"
  | "objective_completed"
  | "quest_abandoned"
  | "badge_earned"
  | "level_up"
  | "shop_claimed"
  | "shop_verified"
  | "new_follower"
  | "new_review"
  | "system"

interface NotificationData {
  user_id: string
  title: string
  message: string
  type: NotificationType
  metadata?: Record<string, any>
  link?: string
  image_url?: string
}

/**
 * Create a notification for a user
 */
export async function createNotification(data: NotificationData) {
  const supabase = await createServerClient()

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: data.user_id,
      title: data.title,
      message: data.message,
      type: data.type,
      metadata: data.metadata || {},
      link: data.link,
      image_url: data.image_url,
      is_read: false,
      created_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    console.error("Error creating notification:", error)
    return { data: null, error: error.message }
  }

  // If we have push notification capabilities, we could trigger them here
  // await sendPushNotification(data.user_id, data.title, data.message)

  revalidatePath("/dashboard/notifications")
  return { data: notification, error: null }
}

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", user.id)
    .select()
    .single()

  if (error) {
    console.error("Error marking notification as read:", error)
    return { data: null, error: error.message }
  }

  revalidatePath("/dashboard/notifications")
  return { data, error: null }
}

/**
 * Mark all notifications as read
 */
export async function markAllNotificationsAsRead() {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .eq("is_read", false)
    .select()

  if (error) {
    console.error("Error marking all notifications as read:", error)
    return { data: null, error: error.message }
  }

  revalidatePath("/dashboard/notifications")
  return { data, error: null }
}

/**
 * Get user notifications
 */
export async function getUserNotifications(limit = 20, offset = 0) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error("Error fetching notifications:", error)
    return { data: null, error: error.message }
  }

  return { data, error: null }
}

/**
 * Get unread notification count
 */
export async function getUnreadNotificationCount() {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: 0, error: null }
  }

  const { count, error } = await supabase
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false)

  if (error) {
    console.error("Error fetching unread notification count:", error)
    return { data: 0, error: error.message }
  }

  return { data: count || 0, error: null }
}

/**
 * Delete a notification
 */
export async function deleteNotification(notificationId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { data: null, error: "User not authenticated" }
  }

  const { data, error } = await supabase.from("notifications").delete().eq("id", notificationId).eq("user_id", user.id)

  if (error) {
    console.error("Error deleting notification:", error)
    return { data: null, error: error.message }
  }

  revalidatePath("/dashboard/notifications")
  return { data: true, error: null }
}
