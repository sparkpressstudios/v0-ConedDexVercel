"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { CalendarIcon, Send, ImageIcon, Users, BarChart } from "lucide-react"
import { FeatureGate } from "@/components/subscription/feature-gate"

interface AdvancedMarketingToolsProps {
  shopId: string
}

export function AdvancedMarketingTools({ shopId }: AdvancedMarketingToolsProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())

  return (
    <FeatureGate
      businessId={shopId}
      featureKey="advanced_announcements"
      title="Advanced Marketing Tools"
      description="Create rich media announcements with scheduling and targeting options."
    >
      <Card>
        <CardHeader>
          <CardTitle>Advanced Marketing Tools</CardTitle>
          <CardDescription>Create and schedule announcements with rich media and targeting options.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="create">Create</TabsTrigger>
              <TabsTrigger value="schedule">Schedule</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>

            <TabsContent value="create" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Announcement Title</Label>
                <Input id="title" placeholder="Enter announcement title" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement content here..."
                  className="min-h-[120px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="w-full">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add Image
                </Button>
                <Button variant="outline" className="w-full">
                  <Users className="mr-2 h-4 w-4" />
                  Target Audience
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <div className="space-y-2">
                <Label>Publication Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} initialFocus />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Notification Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="email-notification" className="rounded border-gray-300" />
                    <Label htmlFor="email-notification">Send email notification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="push-notification" className="rounded border-gray-300" />
                    <Label htmlFor="push-notification">Send push notification</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="app-notification" className="rounded border-gray-300" />
                    <Label htmlFor="app-notification">Show in app notification</Label>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="rounded-md bg-muted p-6 text-center">
                <BarChart className="mx-auto h-10 w-10 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Announcement analytics will appear here after you publish your announcements.
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button className="ml-auto">
            <Send className="mr-2 h-4 w-4" />
            Publish Announcement
          </Button>
        </CardFooter>
      </Card>
    </FeatureGate>
  )
}
