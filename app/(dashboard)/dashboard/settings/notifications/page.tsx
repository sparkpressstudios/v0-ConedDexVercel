"use client"

import { useState } from "react"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function NotificationSettingsPage() {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()
  const [emailSettings, setEmailSettings] = useState({
    newFlavors: true,
    shopUpdates: true,
    weeklyDigest: false,
    marketing: false,
  })
  const [inAppSettings, setInAppSettings] = useState({
    newFlavors: true,
    shopUpdates: true,
    badgeEarned: true,
    teamInvites: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  const handleEmailSettingChange = async (key: keyof typeof emailSettings, value: boolean) => {
    try {
      setIsUpdating(true)
      // In a real app, you would save this to the database
      setEmailSettings((prev) => ({ ...prev, [key]: value }))

      toast({
        title: "Settings updated",
        description: "Your email notification settings have been updated",
      })
    } catch (error) {
      console.error("Error updating email settings:", error)
      toast({
        title: "Error",
        description: "Failed to update email notification settings",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleInAppSettingChange = async (key: keyof typeof inAppSettings, value: boolean) => {
    try {
      setIsUpdating(true)
      // In a real app, you would save this to the database
      setInAppSettings((prev) => ({ ...prev, [key]: value }))

      toast({
        title: "Settings updated",
        description: "Your in-app notification settings have been updated",
      })
    } catch (error) {
      console.error("Error updating in-app settings:", error)
      toast({
        title: "Error",
        description: "Failed to update in-app notification settings",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Notification Settings</h1>
      </div>
      <p className="text-muted-foreground">Manage how and when you receive notifications from ConeDex</p>

      <Tabs defaultValue="push">
        <TabsList>
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
          <TabsTrigger value="email">Email Notifications</TabsTrigger>
          <TabsTrigger value="in-app">In-App Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="push" className="space-y-4 pt-4">
          <NotificationPreferences />
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-800 mb-2">About Push Notifications</h3>
            <p className="text-sm text-amber-700">
              Push notifications allow ConeDex to send you updates even when you're not actively using the website. You
              can change your notification preferences at any time.
            </p>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>Manage the emails you receive from ConeDex</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-new-flavors" className="flex flex-col space-y-1">
                  <span>New flavors</span>
                  <span className="text-xs text-muted-foreground">
                    Receive emails when shops you follow add new flavors
                  </span>
                </Label>
                <Switch
                  id="email-new-flavors"
                  checked={emailSettings.newFlavors}
                  onCheckedChange={(value) => handleEmailSettingChange("newFlavors", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-shop-updates" className="flex flex-col space-y-1">
                  <span>Shop updates</span>
                  <span className="text-xs text-muted-foreground">
                    Receive emails about announcements from shops you follow
                  </span>
                </Label>
                <Switch
                  id="email-shop-updates"
                  checked={emailSettings.shopUpdates}
                  onCheckedChange={(value) => handleEmailSettingChange("shopUpdates", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-weekly-digest" className="flex flex-col space-y-1">
                  <span>Weekly digest</span>
                  <span className="text-xs text-muted-foreground">
                    Receive a weekly summary of new flavors and updates
                  </span>
                </Label>
                <Switch
                  id="email-weekly-digest"
                  checked={emailSettings.weeklyDigest}
                  onCheckedChange={(value) => handleEmailSettingChange("weeklyDigest", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="email-marketing" className="flex flex-col space-y-1">
                  <span>Marketing emails</span>
                  <span className="text-xs text-muted-foreground">Receive promotional emails and special offers</span>
                </Label>
                <Switch
                  id="email-marketing"
                  checked={emailSettings.marketing}
                  onCheckedChange={(value) => handleEmailSettingChange("marketing", value)}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="in-app" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>In-App Notifications</CardTitle>
              <CardDescription>Manage the notifications you see within the ConeDex app</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="in-app-new-flavors" className="flex flex-col space-y-1">
                  <span>New flavors</span>
                  <span className="text-xs text-muted-foreground">
                    Receive notifications when shops you follow add new flavors
                  </span>
                </Label>
                <Switch
                  id="in-app-new-flavors"
                  checked={inAppSettings.newFlavors}
                  onCheckedChange={(value) => handleInAppSettingChange("newFlavors", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="in-app-shop-updates" className="flex flex-col space-y-1">
                  <span>Shop updates</span>
                  <span className="text-xs text-muted-foreground">
                    Receive notifications about announcements from shops you follow
                  </span>
                </Label>
                <Switch
                  id="in-app-shop-updates"
                  checked={inAppSettings.shopUpdates}
                  onCheckedChange={(value) => handleInAppSettingChange("shopUpdates", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="in-app-badge-earned" className="flex flex-col space-y-1">
                  <span>Badge earned</span>
                  <span className="text-xs text-muted-foreground">Receive notifications when you earn a new badge</span>
                </Label>
                <Switch
                  id="in-app-badge-earned"
                  checked={inAppSettings.badgeEarned}
                  onCheckedChange={(value) => handleInAppSettingChange("badgeEarned", value)}
                  disabled={isUpdating}
                />
              </div>

              <div className="flex items-center justify-between space-x-2">
                <Label htmlFor="in-app-team-invites" className="flex flex-col space-y-1">
                  <span>Team invites</span>
                  <span className="text-xs text-muted-foreground">
                    Receive notifications for team invitations and updates
                  </span>
                </Label>
                <Switch
                  id="in-app-team-invites"
                  checked={inAppSettings.teamInvites}
                  onCheckedChange={(value) => handleInAppSettingChange("teamInvites", value)}
                  disabled={isUpdating}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
