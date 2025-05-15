"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface NotificationPreferencesProps {
  userId: string
}

export function NotificationPreferences({ userId }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    email_notifications: true,
    push_notifications: true,
    new_flavor_alerts: true,
    shop_updates: true,
    badge_notifications: true,
    marketing_emails: false,
    weekly_digest: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  // Fetch user preferences
  useEffect(() => {
    const fetchPreferences = async () => {
      try {
        const { data, error } = await supabase
          .from("notification_preferences")
          .select("*")
          .eq("user_id", userId)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data) {
          setPreferences({
            email_notifications: data.email_notifications ?? true,
            push_notifications: data.push_notifications ?? true,
            new_flavor_alerts: data.new_flavor_alerts ?? true,
            shop_updates: data.shop_updates ?? true,
            badge_notifications: data.badge_notifications ?? true,
            marketing_emails: data.marketing_emails ?? false,
            weekly_digest: data.weekly_digest ?? true,
          })
        }
      } catch (error) {
        console.error("Error fetching notification preferences:", error)
        toast({
          title: "Error",
          description: "Failed to load notification preferences",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPreferences()
  }, [userId, supabase, toast])

  // Save preferences
  const savePreferences = async () => {
    setSaving(true)

    try {
      const { error } = await supabase.from("notification_preferences").upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "Preferences saved",
        description: "Your notification preferences have been updated",
      })
    } catch (error) {
      console.error("Error saving notification preferences:", error)
      toast({
        title: "Error",
        description: "Failed to save notification preferences",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  // Handle preference change
  const handleChange = (key: keyof typeof preferences) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Loading your notification preferences...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
        <CardDescription>Customize how and when you receive notifications</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Delivery Methods</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email_notifications">Email Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive notifications via email</p>
              </div>
              <Switch
                id="email_notifications"
                checked={preferences.email_notifications}
                onCheckedChange={() => handleChange("email_notifications")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push_notifications">Push Notifications</Label>
                <p className="text-xs text-muted-foreground">Receive push notifications on your device</p>
              </div>
              <Switch
                id="push_notifications"
                checked={preferences.push_notifications}
                onCheckedChange={() => handleChange("push_notifications")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Notification Types</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="new_flavor_alerts">New Flavor Alerts</Label>
                <p className="text-xs text-muted-foreground">
                  Get notified when new flavors are added to shops you follow
                </p>
              </div>
              <Switch
                id="new_flavor_alerts"
                checked={preferences.new_flavor_alerts}
                onCheckedChange={() => handleChange("new_flavor_alerts")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="shop_updates">Shop Updates</Label>
                <p className="text-xs text-muted-foreground">Get notified about updates from shops you follow</p>
              </div>
              <Switch
                id="shop_updates"
                checked={preferences.shop_updates}
                onCheckedChange={() => handleChange("shop_updates")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="badge_notifications">Badge Notifications</Label>
                <p className="text-xs text-muted-foreground">Get notified when you earn new badges</p>
              </div>
              <Switch
                id="badge_notifications"
                checked={preferences.badge_notifications}
                onCheckedChange={() => handleChange("badge_notifications")}
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-sm font-medium">Email Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="marketing_emails">Marketing Emails</Label>
                <p className="text-xs text-muted-foreground">Receive promotional emails and special offers</p>
              </div>
              <Switch
                id="marketing_emails"
                checked={preferences.marketing_emails}
                onCheckedChange={() => handleChange("marketing_emails")}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly_digest">Weekly Digest</Label>
                <p className="text-xs text-muted-foreground">Receive a weekly summary of new flavors and activity</p>
              </div>
              <Switch
                id="weekly_digest"
                checked={preferences.weekly_digest}
                onCheckedChange={() => handleChange("weekly_digest")}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={savePreferences} disabled={saving}>
          {saving ? "Saving..." : "Save Preferences"}
        </Button>
      </CardFooter>
    </Card>
  )
}
