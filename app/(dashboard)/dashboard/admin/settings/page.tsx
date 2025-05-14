"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Save, Upload, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/components/ui/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const generalFormSchema = z.object({
  siteName: z.string().min(2, {
    message: "Site name must be at least 2 characters.",
  }),
  siteDescription: z.string().optional(),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  supportEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
  logoUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional(),
  faviconUrl: z
    .string()
    .url({
      message: "Please enter a valid URL.",
    })
    .optional(),
})

const featuresFormSchema = z.object({
  enableUserRegistration: z.boolean().default(true),
  enableShopClaims: z.boolean().default(true),
  enableReviews: z.boolean().default(true),
  enableFlavors: z.boolean().default(true),
  enableBadges: z.boolean().default(true),
  enableLeaderboard: z.boolean().default(true),
  enablePushNotifications: z.boolean().default(true),
  enableOfflineMode: z.boolean().default(true),
  maxFlavorsPerShop: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number.",
  }),
  maxImagesPerFlavor: z.string().regex(/^\d+$/, {
    message: "Please enter a valid number.",
  }),
})

const moderationFormSchema = z.object({
  enableAutoModeration: z.boolean().default(true),
  moderationLevel: z.enum(["low", "medium", "high"]),
  requireApprovalForNewShops: z.boolean().default(false),
  requireApprovalForNewFlavors: z.boolean().default(false),
  requireApprovalForReviews: z.boolean().default(false),
  flaggedWords: z.string().optional(),
})

const maintenanceFormSchema = z.object({
  maintenanceMode: z.boolean().default(false),
  maintenanceMessage: z.string().optional(),
  scheduledMaintenanceStart: z.string().optional(),
  scheduledMaintenanceEnd: z.string().optional(),
})

export default function SettingsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)

  // General Settings Form
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      siteName: "ConeDex",
      siteDescription: "The ultimate ice cream flavor discovery platform",
      contactEmail: "contact@conedex.com",
      supportEmail: "support@conedex.com",
      logoUrl: "https://example.com/logo.png",
      faviconUrl: "https://example.com/favicon.ico",
    },
  })

  // Features Form
  const featuresForm = useForm<z.infer<typeof featuresFormSchema>>({
    resolver: zodResolver(featuresFormSchema),
    defaultValues: {
      enableUserRegistration: true,
      enableShopClaims: true,
      enableReviews: true,
      enableFlavors: true,
      enableBadges: true,
      enableLeaderboard: true,
      enablePushNotifications: true,
      enableOfflineMode: true,
      maxFlavorsPerShop: "100",
      maxImagesPerFlavor: "5",
    },
  })

  // Moderation Form
  const moderationForm = useForm<z.infer<typeof moderationFormSchema>>({
    resolver: zodResolver(moderationFormSchema),
    defaultValues: {
      enableAutoModeration: true,
      moderationLevel: "medium",
      requireApprovalForNewShops: true,
      requireApprovalForNewFlavors: false,
      requireApprovalForReviews: false,
      flaggedWords: "inappropriate, offensive, explicit",
    },
  })

  // Maintenance Form
  const maintenanceForm = useForm<z.infer<typeof maintenanceFormSchema>>({
    resolver: zodResolver(maintenanceFormSchema),
    defaultValues: {
      maintenanceMode: false,
      maintenanceMessage: "We're currently performing scheduled maintenance. Please check back soon.",
      scheduledMaintenanceStart: "",
      scheduledMaintenanceEnd: "",
    },
  })

  function onSubmitGeneral(values: z.infer<typeof generalFormSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      toast({
        title: "Settings updated",
        description: "Your general settings have been updated successfully.",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  function onSubmitFeatures(values: z.infer<typeof featuresFormSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      toast({
        title: "Features updated",
        description: "Your feature settings have been updated successfully.",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  function onSubmitModeration(values: z.infer<typeof moderationFormSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      toast({
        title: "Moderation settings updated",
        description: "Your moderation settings have been updated successfully.",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  function onSubmitMaintenance(values: z.infer<typeof maintenanceFormSchema>) {
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => {
      console.log(values)
      toast({
        title: "Maintenance settings updated",
        description: "Your maintenance settings have been updated successfully.",
      })
      setIsSubmitting(false)
    }, 1000)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold">Platform Settings</h1>
        <p className="text-muted-foreground">Manage global settings for the ConeDex platform</p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="moderation">Moderation</TabsTrigger>
          <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <Form {...generalForm}>
            <form onSubmit={generalForm.handleSubmit(onSubmitGeneral)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>General Settings</CardTitle>
                  <CardDescription>Configure basic platform settings and contact information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="siteName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site Name</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormDescription>The name of your platform as it appears to users</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={generalForm.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Contact Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>Primary contact email for the platform</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={generalForm.control}
                    name="siteDescription"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Site Description</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter a brief description of your platform"
                            className="resize-none"
                          />
                        </FormControl>
                        <FormDescription>A short description used in search results and metadata</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={generalForm.control}
                      name="supportEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Support Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormDescription>Email address for user support inquiries</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="space-y-4">
                      <FormField
                        control={generalForm.control}
                        name="logoUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Logo URL</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={generalForm.control}
                        name="faviconUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Favicon URL</FormLabel>
                            <div className="flex gap-2">
                              <FormControl>
                                <Input {...field} />
                              </FormControl>
                              <Button type="button" variant="outline" size="icon">
                                <Upload className="h-4 w-4" />
                              </Button>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6 mt-6">
          <Form {...featuresForm}>
            <form onSubmit={featuresForm.handleSubmit(onSubmitFeatures)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Feature Settings</CardTitle>
                  <CardDescription>Enable or disable platform features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={featuresForm.control}
                      name="enableUserRegistration"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">User Registration</FormLabel>
                            <FormDescription>Allow new users to register on the platform</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableShopClaims"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Shop Claims</FormLabel>
                            <FormDescription>Allow shop owners to claim their shops</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableReviews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Reviews</FormLabel>
                            <FormDescription>Allow users to leave reviews for shops and flavors</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableFlavors"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Flavor Logging</FormLabel>
                            <FormDescription>Allow users to log and discover ice cream flavors</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableBadges"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Badges</FormLabel>
                            <FormDescription>Enable achievement badges for users</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableLeaderboard"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Leaderboard</FormLabel>
                            <FormDescription>Enable user and shop leaderboards</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={featuresForm.control}
                      name="enablePushNotifications"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Push Notifications</FormLabel>
                            <FormDescription>Enable push notifications for users</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="enableOfflineMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Offline Mode</FormLabel>
                            <FormDescription>Enable offline functionality for the PWA</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={featuresForm.control}
                      name="maxFlavorsPerShop"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Flavors Per Shop</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormDescription>Maximum number of flavors a shop can have</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={featuresForm.control}
                      name="maxImagesPerFlavor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Max Images Per Flavor</FormLabel>
                          <FormControl>
                            <Input {...field} type="number" min="1" />
                          </FormControl>
                          <FormDescription>Maximum number of images per flavor</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Moderation Settings */}
        <TabsContent value="moderation" className="space-y-6 mt-6">
          <Form {...moderationForm}>
            <form onSubmit={moderationForm.handleSubmit(onSubmitModeration)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Moderation Settings</CardTitle>
                  <CardDescription>Configure content moderation and approval settings</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={moderationForm.control}
                    name="enableAutoModeration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Auto-Moderation</FormLabel>
                          <FormDescription>Enable AI-powered automatic content moderation</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={moderationForm.control}
                    name="moderationLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moderation Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select moderation level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Low - Only flag obvious violations</SelectItem>
                            <SelectItem value="medium">Medium - Standard moderation</SelectItem>
                            <SelectItem value="high">High - Strict moderation</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>Set the sensitivity level for content moderation</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <FormField
                      control={moderationForm.control}
                      name="requireApprovalForNewShops"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Approve New Shops</FormLabel>
                            <FormDescription>Require manual approval for new shops</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={moderationForm.control}
                      name="requireApprovalForNewFlavors"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Approve New Flavors</FormLabel>
                            <FormDescription>Require manual approval for new flavors</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={moderationForm.control}
                      name="requireApprovalForReviews"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">Approve Reviews</FormLabel>
                            <FormDescription>Require manual approval for reviews</FormDescription>
                          </div>
                          <FormControl>
                            <Switch checked={field.value} onCheckedChange={field.onChange} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={moderationForm.control}
                    name="flaggedWords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Flagged Words</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter comma-separated list of words to flag"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>
                          Content containing these words will be automatically flagged for review
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>

        {/* Maintenance Settings */}
        <TabsContent value="maintenance" className="space-y-6 mt-6">
          <Form {...maintenanceForm}>
            <form onSubmit={maintenanceForm.handleSubmit(onSubmitMaintenance)} className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Settings</CardTitle>
                  <CardDescription>Configure maintenance mode and scheduled downtime</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <FormField
                    control={maintenanceForm.control}
                    name="maintenanceMode"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Maintenance Mode</FormLabel>
                          <FormDescription>Enable maintenance mode to temporarily disable the platform</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={maintenanceForm.control}
                    name="maintenanceMessage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Maintenance Message</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Enter message to display during maintenance"
                            className="min-h-[100px]"
                          />
                        </FormControl>
                        <FormDescription>Message displayed to users during maintenance mode</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={maintenanceForm.control}
                      name="scheduledMaintenanceStart"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled Start</FormLabel>
                          <FormControl>
                            <Input {...field} type="datetime-local" />
                          </FormControl>
                          <FormDescription>When scheduled maintenance will begin</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={maintenanceForm.control}
                      name="scheduledMaintenanceEnd"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Scheduled End</FormLabel>
                          <FormControl>
                            <Input {...field} type="datetime-local" />
                          </FormControl>
                          <FormDescription>When scheduled maintenance will end</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" type="button">
                    Reset
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  )
}
