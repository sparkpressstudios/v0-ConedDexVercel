"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NotificationItem } from "@/components/notifications/notification-item"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export function NotificationBell() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  // Fetch notifications
  useEffect(() => {
    if (!user) return

    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (error) throw error

        setNotifications(data || [])
        setUnreadCount(data?.filter((n) => !n.read).length || 0)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()

    // Set up real-time subscription
    const subscription = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchNotifications()
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user, supabase])

  // Mark notifications as read when popover is opened
  useEffect(() => {
    if (open && unreadCount > 0 && user) {
      const markAsRead = async () => {
        try {
          const { error } = await supabase
            .from("notifications")
            .update({ read: true })
            .eq("user_id", user.id)
            .eq("read", false)

          if (error) throw error

          // Update local state
          setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
          setUnreadCount(0)
        } catch (error) {
          console.error("Error marking notifications as read:", error)
        }
      }

      markAsRead()
    }
  }, [open, unreadCount, user, supabase])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b p-3">
          <h4 className="font-medium">Notifications</h4>
          <Link
            href="/dashboard/notifications"
            className="text-xs text-muted-foreground hover:text-primary"
            onClick={() => setOpen(false)}
          >
            View all
          </Link>
        </div>
        <div className="max-h-[300px] overflow-y-auto">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} onClick={() => setOpen(false)} />
            ))
          ) : (
            <div className="flex items-center justify-center p-6 text-center">
              <p className="text-sm text-muted-foreground">No notifications</p>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
