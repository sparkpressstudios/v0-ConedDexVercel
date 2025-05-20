"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { NotificationsList } from "@/components/notifications/notifications-list"
import { getUnreadNotificationCount } from "@/app/actions/notification-actions"
import { Badge } from "@/components/ui/badge"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    loadUnreadCount()

    // Set up polling to check for new notifications
    const interval = setInterval(loadUnreadCount, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  async function loadUnreadCount() {
    const { data, error } = await getUnreadNotificationCount()

    if (!error && data !== undefined) {
      setUnreadCount(data)
    }
  }

  // Refresh unread count when popover closes
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (!isOpen) {
      // Small delay to allow any read operations to complete
      setTimeout(loadUnreadCount, 500)
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500"
              variant="destructive"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end">
        <NotificationsList />
      </PopoverContent>
    </Popover>
  )
}
