"use client"

import { useState } from "react"
import { usePushNotifications } from "@/hooks/use-push-notifications"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, RefreshCw } from "lucide-react"

export function NotificationPreferences() {
  const { isSupported, isSubscribed, isLoading, subscribe, unsubscribe } = usePushNotifications()

  const [preferences, setPreferences] = useState({
    newFlavors: true,
    shopAnnouncements: true,
    badgeAwards: true,
    systemUpdates: false,
  })

  const handleToggleSubscription = async () => {
    if (isSubscribed) {
      await unsubscribe()
    } else {
      await subscribe()
    }
  }

  const handlePreferenceChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Push Notifications</CardTitle>
          <CardDescription>Your browser doesn't support push notifications.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <BellOff className="h-12 w-12 text-gray-400" />
          </div>
          <p className="text-center text-sm text-gray-500">
            Try using a modern browser like Chrome, Firefox, or Edge to enable push notifications.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Push Notifications</CardTitle>
        <CardDescription>Manage how you receive notifications from ConeDex</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="push-notifications">Enable Push Notifications</Label>
            <p className="text-sm text-gray-500">
              {isSubscribed
                ? "You'll receive notifications about important updates"
                : "Enable to stay updated with the latest from ConeDex"}
            </p>
          </div>
          <Switch
            id="push-notifications"
            checked={isSubscribed}
            onCheckedChange={handleToggleSubscription}
            disabled={isLoading}
          />
        </div>

        {isSubscribed && (
          <div className="space-y-4 pt-4 border-t">
            <h3 className="text-sm font-medium">Notification Categories</h3>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new-flavors">New Flavors</Label>
                <p className="text-sm text-gray-500">Get notified when shops you follow add new flavors</p>
              </div>
              <Switch
                id="new-flavors"
                checked={preferences.newFlavors}
                onCheckedChange={() => handlePreferenceChange("newFlavors")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shop-announcements">Shop Announcements</Label>
                <p className="text-sm text-gray-500">Receive updates from shops you follow</p>
              </div>
              <Switch
                id="shop-announcements"
                checked={preferences.shopAnnouncements}
                onCheckedChange={() => handlePreferenceChange("shopAnnouncements")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="badge-awards">Badge Awards</Label>
                <p className="text-sm text-gray-500">Get notified when you earn new badges</p>
              </div>
              <Switch
                id="badge-awards"
                checked={preferences.badgeAwards}
                onCheckedChange={() => handlePreferenceChange("badgeAwards")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="system-updates">System Updates</Label>
                <p className="text-sm text-gray-500">Receive notifications about ConeDex platform updates</p>
              </div>
              <Switch
                id="system-updates"
                checked={preferences.systemUpdates}
                onCheckedChange={() => handlePreferenceChange("systemUpdates")}
              />
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {isSubscribed && (
          <Button variant="outline" size="sm" className="gap-1">
            <RefreshCw className="h-4 w-4" />
            Test Notification
          </Button>
        )}
        <div className="text-xs text-gray-500">
          {isSubscribed ? (
            <span className="flex items-center gap-1">
              <Bell className="h-3 w-3 text-green-500" />
              Notifications enabled
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <BellOff className="h-3 w-3 text-gray-400" />
              Notifications disabled
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
