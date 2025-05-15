"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Upload, X } from "lucide-react"

const profileFormSchema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters." })
    .max(30, { message: "Username must not be longer than 30 characters." }),
  full_name: z.string().max(60, { message: "Full name must not be longer than 60 characters." }).optional(),
  email: z.string().email({ message: "Please enter a valid email address." }),
  bio: z.string().max(160, { message: "Bio must not be longer than 160 characters." }).optional(),
  location: z.string().max(100, { message: "Location must not be longer than 100 characters." }).optional(),
  website: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .max(100, { message: "Website URL must not be longer than 100 characters." })
    .optional()
    .or(z.literal("")),
  avatar_url: z.string().optional(),
  backdrop_url: z.string().optional(),
  preferences: z.object({
    email_notifications: z.boolean().default(true),
    push_notifications: z.boolean().default(true),
    theme: z.enum(["light", "dark", "system"]).default("system"),
  }),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>

interface ProfileEditFormProps {
  profile: any
}

export default function ProfileEditForm({ profile }: ProfileEditFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || "")
  const [backdropUrl, setBackdropUrl] = useState(profile?.backdrop_url || "")
  const [backdropPreview, setBackdropPreview] = useState<string | null>(profile?.backdrop_url || null)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: profile?.username || "",
      full_name: profile?.full_name || "",
      email: profile?.email || "",
      bio: profile?.bio || "",
      location: profile?.location || "",
      website: profile?.website || "",
      avatar_url: profile?.avatar_url || "",
      backdrop_url: profile?.backdrop_url || "",
      preferences: {
        email_notifications: profile?.preferences?.email_notifications ?? true,
        push_notifications: profile?.preferences?.push_notifications ?? true,
        theme: profile?.preferences?.theme || "system",
      },
    },
  })

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `avatars/${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(filePath)

      if (publicUrlData) {
        const newAvatarUrl = publicUrlData.publicUrl
        setAvatarUrl(newAvatarUrl)
        form.setValue("avatar_url", newAvatarUrl)
      }
    } catch (error) {
      console.error("Error uploading avatar:", error)
      toast({
        title: "Error",
        description: "Could not upload avatar. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleBackdropChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      setIsLoading(true)

      // Create a preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setBackdropPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload the file to Supabase Storage
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `backdrops/${fileName}`

      const { error: uploadError, data } = await supabase.storage.from("profiles").upload(filePath, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage.from("profiles").getPublicUrl(filePath)

      if (publicUrlData) {
        const newBackdropUrl = publicUrlData.publicUrl
        setBackdropUrl(newBackdropUrl)
        form.setValue("backdrop_url", newBackdropUrl)
      }
    } catch (error) {
      console.error("Error uploading backdrop:", error)
      toast({
        title: "Error",
        description: "Could not upload backdrop image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      setIsLoading(true)

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not found")
      }

      // Update profile in the database
      const { error } = await supabase
        .from("profiles")
        .update({
          username: data.username,
          full_name: data.full_name,
          bio: data.bio,
          location: data.location,
          website: data.website,
          avatar_url: data.avatar_url,
          backdrop_url: data.backdrop_url,
          preferences: data.preferences,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) {
        throw error
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Could not update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>
              Update your profile information. This information will be displayed publicly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Backdrop Image */}
            <div className="space-y-4">
              <FormLabel>Profile Backdrop</FormLabel>
              <div className="relative h-48 w-full overflow-hidden rounded-lg bg-muted">
                {backdropPreview ? (
                  <>
                    <img
                      src={backdropPreview || "/placeholder.svg"}
                      alt="Profile backdrop"
                      className="h-full w-full object-cover"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => {
                        setBackdropPreview(null)
                        setBackdropUrl("")
                        form.setValue("backdrop_url", "")
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <div className="flex h-full w-full flex-col items-center justify-center">
                    <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Upload a backdrop image</p>
                  </div>
                )}
                <input
                  id="backdrop-upload"
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleBackdropChange}
                  disabled={isLoading}
                />
              </div>
              <FormDescription>
                Choose a backdrop image for your profile. Recommended size: 1200×400 pixels.
              </FormDescription>
            </div>

            {/* Avatar */}
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={profile?.full_name || "User"} />
                <AvatarFallback>
                  {profile?.full_name?.substring(0, 2) || profile?.username?.substring(0, 2) || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="avatar-upload"
                  className="cursor-pointer rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                  Change Avatar
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                  disabled={isLoading}
                />
                {avatarUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAvatarUrl("")
                      form.setValue("avatar_url", "")
                    }}
                    disabled={isLoading}
                  >
                    Remove
                  </Button>
                )}
              </div>
            </div>

            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="username" {...field} />
                  </FormControl>
                  <FormDescription>
                    This is your public username. It can only contain letters, numbers, and underscores.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your full name" {...field} />
                  </FormControl>
                  <FormDescription>This is your public display name.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="your.email@example.com" {...field} disabled />
                  </FormControl>
                  <FormDescription>Your email address is used for notifications and account recovery.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Bio</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Tell us about yourself" className="resize-none" {...field} />
                  </FormControl>
                  <FormDescription>
                    Write a short bio about yourself. This will be displayed on your profile.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="City, Country" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="preferences.theme"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Theme Preference</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a theme preference" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Select your preferred theme for the application.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Changes
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
