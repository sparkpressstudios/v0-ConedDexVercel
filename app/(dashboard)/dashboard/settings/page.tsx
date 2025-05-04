"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export default function SettingsPage() {
  const { user, refreshSession } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const [profile, setProfile] = useState({
    username: "",
    fullName: "",
    bio: "",
    favoriteIceCream: "",
  })

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        if (data) {
          setProfile({
            username: data.username || "",
            fullName: data.full_name || "",
            bio: data.bio || "",
            favoriteIceCream: data.favorite_flavor || "",
          })
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }

    fetchProfile()
  }, [user, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProfile((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          username: profile.username,
          full_name: profile.fullName,
          bio: profile.bio,
          favorite_flavor: profile.favoriteIceCream,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user?.id)

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })

      // Refresh session to update user data
      await refreshSession()
      router.refresh()
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Profile Settings</CardTitle>
            <CardDescription>Update your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={profile.username}
                onChange={handleChange}
                placeholder="icecreamlover"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={profile.fullName}
                onChange={handleChange}
                placeholder="Jane Smith"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={profile.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself and your ice cream preferences..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="favoriteIceCream">Favorite Ice Cream Flavor</Label>
              <Input
                id="favoriteIceCream"
                name="favoriteIceCream"
                value={profile.favoriteIceCream}
                onChange={handleChange}
                placeholder="Mint Chocolate Chip"
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
          <CardDescription>Manage your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" value={user?.email || ""} disabled />
            <p className="text-xs text-muted-foreground">To change your email address, please contact support.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
