"use client"

import { cn } from "@/lib/utils"
import { DropdownMenuItem } from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/auth-context"

interface NotificationItemProps {
  title: string
  description: string
  time: string
  isUnread?: boolean
}

export function NotificationItem({ title, description, time, isUnread }: NotificationItemProps) {
  const { user } = useAuth()
  const userRole = user?.role || "explorer"
  const isExplorer = userRole === "explorer"
  const isShopOwner = userRole === "shop_owner"
  const isAdmin = userRole === "admin"

  // Get theme colors based on user role
  const getThemeColors = () => {
    if (isExplorer) {
      return {
        unreadBg: "bg-strawberry-50",
        titleColor: "text-strawberry-700",
        timeColor: "text-strawberry-500",
      }
    } else if (isShopOwner) {
      return {
        unreadBg: "bg-mint-50",
        titleColor: "text-mint-700",
        timeColor: "text-mint-500",
      }
    } else {
      return {
        unreadBg: "bg-blueberry-50",
        titleColor: "text-blueberry-700",
        timeColor: "text-blueberry-500",
      }
    }
  }

  const theme = getThemeColors()

  return (
    <DropdownMenuItem className={cn("flex flex-col items-start gap-1 p-4", isUnread && theme.unreadBg)}>
      <div className="flex w-full justify-between">
        <span className={cn("font-medium", isUnread && theme.titleColor)}>{title}</span>
        <span className={cn("text-xs text-muted-foreground", isUnread && theme.timeColor)}>{time}</span>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </DropdownMenuItem>
  )
}
