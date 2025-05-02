"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Megaphone, Mail, Bell, Users, BarChart } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { AdvancedMarketingTools } from "@/components/premium-features/advanced-marketing-tools"
import { SubscriptionBanner } from "@/components/subscription/subscription-banner"

export default function ShopMarketingPage() {
  const [shop, setShop] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function fetchShopData() {
      if (!user) return

      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("shops").select("*").eq("owner_id", user.id).single()

        if (error) throw error
        setShop(data)
      } catch (error) {
        console.error("Error fetching shop data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchShopData()
  }, [user, supabase])

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
            <CardDescription>You need to create or claim a shop to access marketing tools.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Marketing Tools</h1>
        <p className="text-muted-foreground mt-2">Promote your shop and engage with customers.</p>
      </div>

      <SubscriptionBanner businessId={shop.id} />

      <Tabs defaultValue="announcements">
        <TabsList>
          <TabsTrigger value="announcements">Announcements</TabsTrigger>
          <TabsTrigger value="email">Email Marketing</TabsTrigger>
          <TabsTrigger value="push">Push Notifications</TabsTrigger>
          <TabsTrigger value="audience">Audience</TabsTrigger>
        </TabsList>

        <TabsContent value="announcements" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Basic Announcements</CardTitle>
                <CardDescription>Create simple announcements for your shop.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="basic-title" className="text-sm font-medium">
                    Title
                  </label>
                  <input
                    id="basic-title"
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="basic-content" className="text-sm font-medium">
                    Content
                  </label>
                  <textarea
                    id="basic-content"
                    className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2"
                    placeholder="Write your announcement here..."
                  ></textarea>
                </div>
                <Button className="w-full">
                  <Megaphone className="mr-2 h-4 w-4" />
                  Post Announcement
                </Button>
              </CardContent>
            </Card>

            <AdvancedMarketingTools shopId={shop.id} />
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Email Marketing</CardTitle>
              <CardDescription>Send email campaigns to your customers.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Mail className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Email marketing requires a premium subscription.</p>
                <Button variant="link" className="mt-2">
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="push" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Push Notifications</CardTitle>
              <CardDescription>Send push notifications to app users.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Bell className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Push notifications require a premium subscription.</p>
                <Button variant="link" className="mt-2">
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audience" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audience Management</CardTitle>
              <CardDescription>Manage and segment your customer audience.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 flex-col items-center justify-center text-center">
                <Users className="mb-2 h-8 w-8 text-muted-foreground" />
                <p className="text-muted-foreground">Audience management requires a premium subscription.</p>
                <Button variant="link" className="mt-2">
                  Upgrade to Premium
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Marketing Performance</CardTitle>
          <CardDescription>Track the performance of your marketing campaigns.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex h-60 flex-col items-center justify-center text-center">
            <BarChart className="mb-2 h-8 w-8 text-muted-foreground" />
            <p className="text-muted-foreground">
              Marketing analytics will appear here once you have active campaigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
