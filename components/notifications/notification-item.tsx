"use client"

import { useState } from "react"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"
import { MessageSquare, Award, Store, IceCream, AlertCircle, Check, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    created_at: string
    data?: any
  }
  onClick?: () => void
}

export function NotificationItem({ notification, onClick }: NotificationItemProps) {
  const [isRead, setIsRead] = useState(notification.read)

  // Get the notification icon based on type
  const getIcon = () => {
    switch (notification.type) {
      case "message":
        return <MessageSquare className="h-5 w-5 text-blue-500" />
      case "badge_awarded":
        return <Award className="h-5 w-5 text-yellow-500" />
      case "shop_claim":
      case "claim_reviewed":
        return <Store className="h-5 w-5 text-green-500" />
      case "flavor_added":
        return <IceCream className="h-5 w-5 text-purple-500" />
      case "alert":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      case "success":
        return <Check className="h-5 w-5 text-green-500" />
      case "info":
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  // Get the notification link based on type and data
  const getLink = () => {
    const data = notification.data || {}

    switch (notification.type) {
      case "badge_awarded":
        return `/dashboard/badges`
      case "shop_claim":
      case "claim_reviewed":
        return data.shop_id ? `/dashboard/shops/${data.shop_id}` : `/dashboard/shop`
      case "flavor_added":
        return data.flavor_id ? `/dashboard/flavors/${data.flavor_id}` : `/dashboard/flavors`
      case "message":
        return `/dashboard/notifications`
      default:
        return `/dashboard/notifications`
    }
  }

  // Format the notification time
  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "recently"
    }
  }

  return (
    <Link
      href={getLink()}
      className={cn(
        "flex items-start gap-3 border-b p-3 transition-colors hover:bg-muted/50",
        !isRead && "bg-muted/30",
      )}
      onClick={() => {
        setIsRead(true)
        onClick?.()
      }}
    >
      <div className="mt-0.5">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <p className={cn("text-sm font-medium", !isRead && "font-semibold")}>{notification.title}</p>
        <p className="text-xs text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{formatTime(notification.created_at)}</p>
      </div>
    </Link>
  )
}
