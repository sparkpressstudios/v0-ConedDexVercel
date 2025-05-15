import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Bell, MessageSquare, Trash2 } from "lucide-react"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"

export const metadata: Metadata = {
  title: "Notifications | ConeDex",
  description: "View and manage your notifications",
}

export default async function NotificationsPage() {
  const supabase = createServerClient()

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <Bell className="h-10 w-10 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Please sign in to view your notifications</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get notifications
  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50)

  // Get messages
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("recipient_id", user.id)
    .order("created_at", { ascending: false })
    .limit(20)

  // Count unread notifications
  const unreadCount = notifications?.filter((n) => !n.read).length || 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground">View and manage your notifications and messages</p>
        </div>
        <form
          action={async () => {
            "use server"
            const supabase = createServerClient()
            await supabase.from("notifications").update({ read: true }).eq("user_id", user.id)
          }}
        >
          <Button type="submit" variant="outline" size="sm" className="gap-1">
            <Trash2 className="h-4 w-4" />
            Mark All as Read
          </Button>
        </form>
      </div>

      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
            {unreadCount > 0 && (
              <span className="ml-1 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="messages" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span>Messages</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex items-center gap-2">
            <span>Preferences</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Your recent notifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications && notifications.length > 0 ? (
                <div className="space-y-1 divide-y">
                  {notifications.map((notification) => (
                    <NotificationItem key={notification.id} notification={notification} />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Bell className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You don't have any notifications yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Messages</CardTitle>
              <CardDescription>Your recent messages and conversations</CardDescription>
            </CardHeader>
            <CardContent>
              {messages && messages.length > 0 ? (
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div key={message.id} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{message.subject || "No Subject"}</h3>
                        <span className="text-xs text-muted-foreground">
                          {new Date(message.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{message.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <MessageSquare className="h-10 w-10 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">You don't have any messages yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences userId={user.id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
