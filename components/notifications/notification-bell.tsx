"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { NotificationItem } from "@/components/notifications/notification-item"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [unreadCount, setUnreadCount] = useState(3)
  const { user } = useAuth()
  const userRole = user?.role || "explorer"
  const isExplorer = userRole === "explorer"
  const isShopOwner = userRole === "shop_owner"
  const isAdmin = userRole === "admin"

  // Get theme colors based on user role
  const getThemeColors = () => {
    if (isExplorer) {
      return {
        buttonHover: "hover:bg-strawberry-100",
        badgeBg: "bg-strawberry-500",
        dropdownBorder: "border-strawberry-100",
      }
    } else if (isShopOwner) {
      return {
        buttonHover: "hover:bg-mint-100",
        badgeBg: "bg-mint-500",
        dropdownBorder: "border-mint-100",
      }
    } else {
      return {
        buttonHover: "hover:bg-blueberry-100",
        badgeBg: "bg-blueberry-500",
        dropdownBorder: "border-blueberry-100",
      }
    }
  }

  const theme = getThemeColors()

  const markAllAsRead = () => {
    setUnreadCount(0)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("relative", theme.buttonHover)}>
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span
              className={cn(
                "absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-medium text-white",
                theme.badgeBg,
              )}
            >
              {unreadCount}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn("w-80", theme.dropdownBorder)}>
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto text-xs">
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <NotificationItem
          title="New Badge Earned!"
          description="You've earned the 'Flavor Explorer' badge for trying 10 different flavors."
          time="Just now"
          isUnread
        />
        <NotificationItem
          title="Shop Near You"
          description="Scoops Ahoy just added 3 new flavors to their menu."
          time="2 hours ago"
          isUnread
        />
        <NotificationItem
          title="Leaderboard Update"
          description="You moved up 5 positions on the leaderboard!"
          time="Yesterday"
          isUnread
        />
        <NotificationItem
          title="Weekly Digest"
          description="Check out the most popular flavors from last week."
          time="3 days ago"
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a href="/dashboard/notifications" className="cursor-pointer justify-center text-center">
            View all notifications
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
