"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { Bell, CheckCircle, Store, IceCream, Award, AlertCircle, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NotificationItemProps {
  notification: any
  onMarkAsRead: (id: string) => void
  onClose?: () => void
}

export function NotificationItem({ notification, onMarkAsRead, onClose }: NotificationItemProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getNotificationIcon = () => {
    switch (notification.type) {
      case "new_flavor":
        return <IceCream className="h-5 w-5 text-blue-500" />
      case "shop_update":
        return <Store className="h-5 w-5 text-green-500" />
      case "verification_approved":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "verification_rejected":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "badge_earned":
        return <Award className="h-5 w-5 text-amber-500" />
      case "announcement":
        return <MessageSquare className="h-5 w-5 text-purple-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationLink = () => {
    switch (notification.type) {
      case "new_flavor":
        return `/dashboard/shops/${notification.shop_id}`
      case "shop_update":
        return `/dashboard/shops/${notification.shop_id}`
      case "verification_approved":
      case "verification_rejected":
        return `/dashboard/shop/profile`
      case "badge_earned":
        return `/dashboard/badges`
      case "announcement":
        return `/dashboard/shops/${notification.shop_id}`
      default:
        return "#"
    }
  }

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkAsRead(notification.id)
    }
    if (onClose) {
      onClose()
    }
  }

  return (
    <Link
      href={getNotificationLink()}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        block border-b last:border-0 p-4 
        ${notification.is_read ? "bg-background" : "bg-muted/30"} 
        ${isHovered ? "bg-muted/50" : ""}
      `}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-0.5">{getNotificationIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">{notification.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </p>
        </div>
        {!notification.is_read && isHovered && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onMarkAsRead(notification.id)
            }}
          >
            Mark read
          </Button>
        )}
      </div>
    </Link>
  )
}
