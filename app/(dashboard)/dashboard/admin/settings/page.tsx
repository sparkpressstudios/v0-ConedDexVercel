"use client"

import { useState } from "react"
import { Save } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Settings saved",
        description: "Your settings have been saved successfully.",
      })
    }, 1000)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform-wide settings and preferences</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage basic platform configuration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="site-name">Platform Name</Label>
                <Input id="site-name" defaultValue="ConeDex" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="contact-email">Contact Email</Label>
                  <Input id="contact-email" type="email" defaultValue="support@conedex.app" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="support-phone">Support Phone (Optional)</Label>
                  <Input id="support-phone" type="tel" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="site-description">Platform Description</Label>
                <Textarea
                  id="site-description"
                  defaultValue="ConeDex is the ultimate platform for ice cream enthusiasts to discover, log, and share their favorite flavors and shops."
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="maintenance-mode">Maintenance Mode</Label>
                  <Switch id="maintenance-mode" />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, the site will display a maintenance message to all users except admins.
                </p>
              </div>

              <div className="space-y-2">
                <Label>User Registration</Label>
                <RadioGroup defaultValue="open">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="open" id="registration-open" />
                    <Label htmlFor="registration-open">Open to everyone</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="invite" id="registration-invite" />
                    <Label htmlFor="registration-invite">Invite only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="closed" id="registration-closed" />
                    <Label htmlFor="registration-closed">Closed</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of the platform</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme Colors</Label>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-mint-500"></div>
                    <span className="text-xs">Mint</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-strawberry-500"></div>
                    <span className="text-xs">Strawberry</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-blueberry-500"></div>
                    <span className="text-xs">Blueberry</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-chocolate-500"></div>
                    <span className="text-xs">Chocolate</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-vanilla-500"></div>
                    <span className="text-xs">Vanilla</span>
                  </div>
                  <div className="flex flex-col items-center gap-2">
                    <div className="h-10 w-10 rounded-full bg-gray-500"></div>
                    <span className="text-xs">Custom</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode Default</Label>
                  <Switch id="dark-mode" />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, new users will see the dark theme by default.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo-upload">Logo Upload</Label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-md border flex items-center justify-center">
                    <IceCream className="h-8 w-8 text-mint-500" />
                  </div>
                  <Button variant="outline" size="sm">
                    Upload New Logo
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure system-wide notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Email Notifications</Label>
                    <p className="text-sm text-muted-foreground">Configure system email notifications</p>
                  </div>
                  <Switch id="email-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Push Notifications</Label>
                    <p className="text-sm text-muted-foreground">Configure system push notifications</p>
                  </div>
                  <Switch id="push-notifications" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">In-App Notifications</Label>
                    <p className="text-sm text-muted-foreground">Configure system in-app notifications</p>
                  </div>
                  <Switch id="in-app-notifications" defaultChecked />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notification-email">Notification From Email</Label>
                <Input id="notification-email" type="email" defaultValue="notifications@conedex.app" />
                <p className="text-sm text-muted-foreground">
                  This email will be used as the sender for all system notifications.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure advanced system settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="debug-mode">Debug Mode</Label>
                  <Switch id="debug-mode" />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, additional debugging information will be logged.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="api-access">Public API Access</Label>
                  <Switch id="api-access" />
                </div>
                <p className="text-sm text-muted-foreground">
                  When enabled, the public API will be accessible to third-party applications.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cache-ttl">Cache TTL (seconds)</Label>
                <Input id="cache-ttl" type="number" defaultValue="3600" />
                <p className="text-sm text-muted-foreground">
                  Time to live for cached data in seconds. Set to 0 to disable caching.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="rate-limit">API Rate Limit (requests per minute)</Label>
                <Input id="rate-limit" type="number" defaultValue="60" />
                <p className="text-sm text-muted-foreground">
                  Maximum number of API requests allowed per minute per IP address.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Reset</Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
                {!isSaving && <Save className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function IceCream({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 17c5 0 8-2.69 8-6H4c0 3.31 3 6 8 6Zm-4 4h8m-4-3v3M5.14 11a3.5 3.5 0 1 1 6.71 0M12.14 11a3.5 3.5 0 1 1 6.71 0M15.5 6.5a3.5 3.5 0 1 0-7 0" />
    </svg>
  )
}
