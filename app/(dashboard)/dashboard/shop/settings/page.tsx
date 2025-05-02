"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShopSettingsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [shop, setShop] = useState<any | null>(null)
  const [hours, setHours] = useState({
    monday: { open: "09:00", close: "21:00", closed: false },
    tuesday: { open: "09:00", close: "21:00", closed: false },
    wednesday: { open: "09:00", close: "21:00", closed: false },
    thursday: { open: "09:00", close: "21:00", closed: false },
    friday: { open: "09:00", close: "22:00", closed: false },
    saturday: { open: "10:00", close: "22:00", closed: false },
    sunday: { open: "11:00", close: "20:00", closed: false },
  })
  const [settings, setSettings] = useState({
    allow_reviews: true,
    show_ratings: true,
    public_profile: true,
    email_notifications: true,
  })

  useEffect(() => {
    const fetchShopData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) {
          if (shopError.code === "PGRST116") {
            // No shop found, redirect to claim page
            router.push("/dashboard/shop/claim")
            return
          }
          throw shopError
        }

        setShop(shopData)

        // Set hours if available
        if (shopData.hours) {
          setHours(shopData.hours)
        }

        // Set settings if available
        if (shopData.settings) {
          setSettings(shopData.settings)
        }
      } catch (error) {
        console.error("Error fetching shop data:", error)
        toast({
          title: "Error",
          description: "Failed to load shop data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase, router, toast])

  const handleHoursChange = (day: string, field: string, value: string | boolean) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof typeof prev],
        [field]: value,
      },
    }))
  }

  const handleSettingsChange = (setting: string, value: boolean) => {
    setSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))
  }

  const handleSaveHours = async () => {
    if (!user || !shop) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("shops")
        .update({
          hours,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shop.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Business hours updated successfully",
      })
    } catch (error) {
      console.error("Error updating hours:", error)
      toast({
        title: "Error",
        description: "Failed to update business hours",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveSettings = async () => {
    if (!user || !shop) return

    setSaving(true)

    try {
      const { error } = await supabase
        .from("shops")
        .update({
          settings,
          updated_at: new Date().toISOString(),
        })
        .eq("id", shop.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Settings updated successfully",
      })
    } catch (error) {
      console.error("Error updating settings:", error)
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div>
            <Skeleton className="h-8 w-48" />
            <Skeleton className="mt-1 h-4 w-64" />
          </div>
        </div>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-60" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You haven't claimed or created a shop yet.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Shop Settings</h1>
          <p className="text-muted-foreground">{shop.name}</p>
        </div>
      </div>

      <Tabs defaultValue="hours" className="space-y-6">
        <TabsList>
          <TabsTrigger value="hours" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Business Hours
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            General Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle>Business Hours</CardTitle>
              <CardDescription>Set your shop's operating hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(hours).map(([day, { open, close, closed }]) => (
                <div key={day} className="flex flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="w-32">
                    <Label className="capitalize">{day}</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={!closed}
                      onCheckedChange={(checked) => handleHoursChange(day, "closed", !checked)}
                    />
                    <Label>{closed ? "Closed" : "Open"}</Label>
                  </div>
                  {!closed && (
                    <div className="flex flex-1 items-center gap-2">
                      <div className="grid w-full grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor={`${day}-open`}>Open</Label>
                          <Input
                            id={`${day}-open`}
                            type="time"
                            value={open}
                            onChange={(e) => handleHoursChange(day, "open", e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`${day}-close`}>Close</Label>
                          <Input
                            id={`${day}-close`}
                            type="time"
                            value={close}
                            onChange={(e) => handleHoursChange(day, "close", e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveHours} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Hours"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Configure your shop's settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow_reviews">Allow Reviews</Label>
                  <p className="text-sm text-muted-foreground">Let customers leave reviews for your shop and flavors</p>
                </div>
                <Switch
                  id="allow_reviews"
                  checked={settings.allow_reviews}
                  onCheckedChange={(checked) => handleSettingsChange("allow_reviews", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="show_ratings">Show Ratings</Label>
                  <p className="text-sm text-muted-foreground">Display customer ratings on your shop profile</p>
                </div>
                <Switch
                  id="show_ratings"
                  checked={settings.show_ratings}
                  onCheckedChange={(checked) => handleSettingsChange("show_ratings", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="public_profile">Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your shop visible in search results and the shop directory
                  </p>
                </div>
                <Switch
                  id="public_profile"
                  checked={settings.public_profile}
                  onCheckedChange={(checked) => handleSettingsChange("public_profile", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="email_notifications">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email notifications for new reviews and flavor logs
                  </p>
                </div>
                <Switch
                  id="email_notifications"
                  checked={settings.email_notifications}
                  onCheckedChange={(checked) => handleSettingsChange("email_notifications", checked)}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end border-t px-6 py-4">
              <Button onClick={handleSaveSettings} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                  </>
                ) : (
                  "Save Settings"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
