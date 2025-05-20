"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "@/app/actions/notification-actions"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Bell, Award, MapPin, Star, CheckCircle, User, MessageSquare, Info, X } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type NotificationType =
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

interface Notification {
  id: string
  title: string
  message: string
  type: NotificationType
  is_read: boolean
  created_at: string
  read_at?: string
  link?: string
  image_url?: string
  metadata?: Record<string, any>
}

export function NotificationsList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    loadNotifications()
  }, [])

  async function loadNotifications() {
    setLoading(true)
    const { data, error } = await getUserNotifications(50)

    if (error) {
      toast({
        title: "Error loading notifications",
        description: error,
        variant: "destructive",
      })
    } else if (data) {
      setNotifications(data)
    }

    setLoading(false)
  }

  async function handleMarkAsRead(id: string) {
    const { error } = await markNotificationAsRead(id)

    if (error) {
      toast({
        title: "Error marking notification as read",
        description: error,
        variant: "destructive",
      })
    } else {
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, is_read: true } : notification)),
      )
    }
  }

  async function handleMarkAllAsRead() {
    const { error } = await markAllNotificationsAsRead()

    if (error) {
      toast({
        title: "Error marking all notifications as read",
        description: error,
        variant: "destructive",
      })
    } else {
      setNotifications((prev) => prev.map((notification) => ({ ...notification, is_read: true })))
      toast({
        title: "All notifications marked as read",
        description: "Your notifications have been updated",
      })
    }
  }

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "quest_joined":
      case "quest_completed":
      case "objective_completed":
      case "quest_abandoned":
        return <Award className="h-5 w-5 text-purple-500" />
      case "badge_earned":
        return <Star className="h-5 w-5 text-amber-500" />
      case "level_up":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "shop_claimed":
      case "shop_verified":
        return <MapPin className="h-5 w-5 text-blue-500" />
      case "new_follower":
        return <User className="h-5 w-5 text-indigo-500" />
      case "new_review":
        return <MessageSquare className="h-5 w-5 text-pink-500" />
      case "system":
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case "quest_joined":
      case "quest_completed":
      case "objective_completed":
      case "quest_abandoned":
        return "bg-purple-50 border-purple-200"
      case "badge_earned":
        return "bg-amber-50 border-amber-200"
      case "level_up":
        return "bg-green-50 border-green-200"
      case "shop_claimed":
      case "shop_verified":
        return "bg-blue-50 border-blue-200"
      case "new_follower":
        return "bg-indigo-50 border-indigo-200"
      case "new_review":
        return "bg-pink-50 border-pink-200"
      case "system":
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (activeTab === "all") return true
    if (activeTab === "unread") return !notification.is_read
    if (activeTab === "quests")
      return ["quest_joined", "quest_completed", "objective_completed", "quest_abandoned"].includes(notification.type)
    if (activeTab === "badges") return notification.type === "badge_earned"
    if (activeTab === "shops") return ["shop_claimed", "shop_verified"].includes(notification.type)
    if (activeTab === "social") return ["new_follower", "new_review"].includes(notification.type)
    return true
  })

  const unreadCount = notifications.filter((n) => !n.is_read).length

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Stay updated with your activity</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Stay updated with your activity</CardDescription>
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="px-6">
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">
                All
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">
                Unread {unreadCount > 0 && `(${unreadCount})`}
              </TabsTrigger>
              <TabsTrigger value="quests" className="flex-1">
                Quests
              </TabsTrigger>
              <TabsTrigger value="badges" className="flex-1">
                Badges
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="m-0">
            <NotificationsContent
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>

          <TabsContent value="unread" className="m-0">
            <NotificationsContent
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>

          <TabsContent value="quests" className="m-0">
            <NotificationsContent
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>

          <TabsContent value="badges" className="m-0">
            <NotificationsContent
              notifications={filteredNotifications}
              onMarkAsRead={handleMarkAsRead}
              getNotificationIcon={getNotificationIcon}
              getNotificationColor={getNotificationColor}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-3">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/dashboard/notifications">View all notifications</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function NotificationsContent({
  notifications,
  onMarkAsRead,
  getNotificationIcon,
  getNotificationColor,
}: {
  notifications: Notification[]
  onMarkAsRead: (id: string) => void
  getNotificationIcon: (type: NotificationType) => React.ReactNode
  getNotificationColor: (type: NotificationType) => string
}) {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <Bell className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No notifications to display</p>
      </div>
    )
  }

  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-1 p-1">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`flex items-start gap-3 p-3 rounded-lg border ${getNotificationColor(
              notification.type,
            )} ${!notification.is_read ? "bg-opacity-70" : "bg-opacity-30"}`}
          >
            <div className="flex-shrink-0 mt-1">{getNotificationIcon(notification.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-medium line-clamp-1">{notification.title}</p>
                  <p className="text-sm text-muted-foreground">{notification.message}</p>
                </div>
                {!notification.is_read && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 rounded-full"
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Mark as read</span>
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                </p>
                {!notification.is_read && <Badge variant="outline">New</Badge>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
