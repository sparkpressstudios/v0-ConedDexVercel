"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

type AnalyticsEvent = {
  event_type: string
  event_data?: Record<string, any>
  user_id?: string
  session_id?: string
  device_type?: string
  browser?: string
  os?: string
  screen_size?: string
  referrer?: string
  page_url?: string
  app_version?: string
}

export async function trackEvent(event: AnalyticsEvent) {
  try {
    const supabase = createServerActionClient({ cookies })

    // Get the current user if available
    const {
      data: { session },
    } = await supabase.auth.getSession()
    const userId = session?.user?.id || event.user_id || null

    // Insert the event into the analytics_events table
    const { error } = await supabase.from("analytics_events").insert({
      id: uuidv4(),
      event_type: event.event_type,
      event_data: event.event_data || {},
      user_id: userId,
      session_id: event.session_id || null,
      device_type: event.device_type || null,
      browser: event.browser || null,
      os: event.os || null,
      screen_size: event.screen_size || null,
      referrer: event.referrer || null,
      page_url: event.page_url || null,
      app_version: event.app_version || null,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error tracking event:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error in trackEvent:", error)
    return { success: false, error }
  }
}

export async function getAnalyticsData(metric: string, timeframe = "30d") {
  try {
    const supabase = createServerActionClient({ cookies })

    // Different queries based on the requested metric
    switch (metric) {
      case "installations":
        const { data: installData, error: installError } = await supabase
          .from("analytics_events")
          .select("created_at")
          .eq("event_type", "app_installed")
          .gte("created_at", getTimeframeDate(timeframe))
          .order("created_at", { ascending: true })

        if (installError) throw installError
        return { success: true, data: installData }

      case "active_users":
        const { data: userData, error: userError } = await supabase
          .from("analytics_events")
          .select("user_id, created_at")
          .gte("created_at", getTimeframeDate(timeframe))
          .order("created_at", { ascending: true })

        if (userError) throw userError

        // Count unique users per day
        const uniqueUsers = countUniqueUsersByDay(userData)
        return { success: true, data: uniqueUsers }

      // Add more metrics as needed

      default:
        return { success: false, error: "Invalid metric" }
    }
  } catch (error) {
    console.error("Error in getAnalyticsData:", error)
    return { success: false, error }
  }
}

// Helper function to get date for timeframe
function getTimeframeDate(timeframe: string): string {
  const now = new Date()

  switch (timeframe) {
    case "7d":
      now.setDate(now.getDate() - 7)
      break
    case "30d":
      now.setDate(now.getDate() - 30)
      break
    case "90d":
      now.setDate(now.getDate() - 90)
      break
    case "1y":
      now.setFullYear(now.getFullYear() - 1)
      break
    default:
      now.setDate(now.getDate() - 30) // Default to 30 days
  }

  return now.toISOString()
}

// Helper function to count unique users by day
function countUniqueUsersByDay(data: any[]) {
  const usersByDay: Record<string, Set<string>> = {}

  data.forEach((item) => {
    const date = new Date(item.created_at).toISOString().split("T")[0]
    if (!usersByDay[date]) {
      usersByDay[date] = new Set()
    }
    if (item.user_id) {
      usersByDay[date].add(item.user_id)
    }
  })

  return Object.entries(usersByDay).map(([date, users]) => ({
    date,
    count: users.size,
  }))
}
