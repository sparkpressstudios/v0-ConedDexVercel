"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { User, Settings, IceCream, MapPin, Award, Star, Heart, Users, Edit, LogOut } from "lucide-react"

export default function MobileProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true)

      try {
        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          throw new Error("User not found")
        }

        // Get user profile
        const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).single()

        if (error) throw error

        // In a real implementation, you would fetch actual profile data
        // This is a placeholder that adds mock data to the profile

        // Mock profile data
        const mockProfile = {
          ...data,
          total_flavors_logged: 32,
          total_shops_visited: 15,
          total_badges: 8,
          total_following: 24,
          total_followers: 18,
          favorite_flavor: "Mint Chocolate Chip",
          recent_flavors: [
            {
              id: "1",
              name: "Vanilla Bean",
              shop_name: "Creamy Delights",
              rating: 4.5,
              logged_at: "2023-06-15T14:30:00Z",
            },
            {
              id: "2",
              name: "Chocolate Fudge",
              shop_name: "Frosty Scoops",
              rating: 4.8,
              logged_at: "2023-06-10T11:15:00Z",
            },
            {
              id: "3",
              name: "Strawberry Swirl",
              shop_name: "Sweet Treats Ice Cream",
              rating: 4.2,
              logged_at: "2023-06-05T16:45:00Z",
            },
          ],
          badges: [
            {
              id: "1",
              name: "Ice Cream Explorer",
              description: "Visited 10 different ice cream shops",
              image_url: null,
              earned_at: "2023-05-20T10:30:00Z",
            },
            {
              id: "2",
              name: "Flavor Enthusiast",
              description: "Logged 25 different flavors",
              image_url: null,
              earned_at: "2023-05-15T14:45:00Z",
            },
            {
              id: "3",
              name: "Social Scooper",
              description: "Followed 20 other users",
              image_url: null,
              earned_at: "2023-05-10T09:15:00Z",
            },
          ],
        }

        setProfile(mockProfile)
      } catch (error) {
        console.error("Error fetching profile:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [supabase])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  if (loading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-40 w-full" />
        <div className="flex items-center gap-4">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] p-4">
        <User className="h-12 w-12 text-neutral-300 mb-4" />
        <h2 className="text-xl font-bold mb-2">Profile Not Found</h2>
        <p className="text-muted-foreground text-center mb-6">We couldn't find your profile information.</p>
        <Button asChild>
          <Link href="/login">Sign In</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="pb-16">
      {/* Cover Image */}
      <div className="relative h-40 w-full bg-neutral-100">
        {profile.backdrop_photo ? (
          <Image
            src={profile.backdrop_photo || "/placeholder.svg"}
            alt={`${profile.username} backdrop`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-primary-100 to-primary-200 flex items-center justify-center">
            <User className="h-12 w-12 text-primary-300" />
          </div>
        )}
        <Button variant="secondary" size="icon" className="absolute top-4 right-4" asChild>
          <Link href="/dashboard/settings">
            <Settings className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      {/* Profile Info */}
      <div className="p-4">
        <div className="flex items-start gap-4 mb-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-md -mt-12">
            <AvatarImage
              src={profile.avatar_url || `https://avatar.vercel.sh/${profile.username}.png`}
              alt={profile.username}
            />
            <AvatarFallback>{profile.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1 pt-2">
            <h2 className="text-xl font-bold">{profile.full_name || profile.username}</h2>
            <p className="text-sm text-muted-foreground">@{profile.username}</p>
            <div className="flex gap-2 mt-2">
              <Button asChild size="sm">
                <Link href="/dashboard/profile/edit">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Bio */}
        {profile.bio && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <p className="text-sm">{profile.bio}</p>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <Card>
            <CardContent className="p-3 text-center">
              <IceCream className="h-5 w-5 mx-auto mb-1 text-primary-500" />
              <div className="text-xl font-bold">{profile.total_flavors_logged}</div>
              <p className="text-xs text-muted-foreground">Flavors</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <MapPin className="h-5 w-5 mx-auto mb-1 text-primary-500" />
              <div className="text-xl font-bold">{profile.total_shops_visited}</div>
              <p className="text-xs text-muted-foreground">Shops</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Award className="h-5 w-5 mx-auto mb-1 text-primary-500" />
              <div className="text-xl font-bold">{profile.total_badges}</div>
              <p className="text-xs text-muted-foreground">Badges</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="conedex">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="conedex">
              <IceCream className="h-4 w-4 mr-2" />
              ConeDex
            </TabsTrigger>
            <TabsTrigger value="badges">
              <Award className="h-4 w-4 mr-2" />
              Badges
            </TabsTrigger>
            <TabsTrigger value="following">
              <Heart className="h-4 w-4 mr-2" />
              Following
            </TabsTrigger>
            <TabsTrigger value="followers">
              <Users className="h-4 w-4 mr-2" />
              Followers
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conedex" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">My ConeDex</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/my-conedex">View All</Link>
              </Button>
            </div>

            {profile.favorite_flavor && (
              <Card className="mb-4">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Favorite Flavor</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <IceCream className="h-5 w-5 text-primary-500" />
                    </div>
                    <div>
                      <h4 className="font-medium">{profile.favorite_flavor}</h4>
                      <p className="text-xs text-muted-foreground">Your most logged flavor</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <h4 className="text-sm font-medium mb-2">Recently Logged</h4>
            <div className="space-y-3">
              {profile.recent_flavors.map((flavor: any) => (
                <Card key={flavor.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <IceCream className="h-5 w-5 text-primary-500" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{flavor.name}</h4>
                        <p className="text-xs text-muted-foreground">{flavor.shop_name}</p>
                      </div>
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 mr-1" />
                        <span className="text-sm font-medium">{flavor.rating}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" asChild className="w-full">
                <Link href="/dashboard/log-flavor">
                  <IceCream className="h-4 w-4 mr-2" />
                  Log a New Flavor
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="badges" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">My Badges</h3>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/badges">View All</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {profile.badges.map((badge: any) => (
                <Card key={badge.id} className="overflow-hidden">
                  <CardContent className="p-3">
                    <div className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center mb-2">
                        <Award className="h-8 w-8 text-primary-500" />
                      </div>
                      <h4 className="font-medium text-sm">{badge.name}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}

              <Button variant="outline" asChild className="col-span-2">
                <Link href="/dashboard/quests">
                  <Award className="h-4 w-4 mr-2" />
                  Complete Quests to Earn More
                </Link>
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="following" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Following</h3>
              <span className="text-sm text-muted-foreground">{profile.total_following} following</span>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                  <h3 className="font-medium mb-1">Follow More Users</h3>
                  <p className="text-sm text-muted-foreground mb-4">Connect with other ice cream enthusiasts</p>
                  <Button asChild>
                    <Link href="/dashboard/explore-users">
                      <Users className="h-4 w-4 mr-2" />
                      Explore Users
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="followers" className="mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Followers</h3>
              <span className="text-sm text-muted-foreground">{profile.total_followers} followers</span>
            </div>

            <Card>
              <CardContent className="p-4">
                <div className="text-center py-4">
                  <Users className="h-12 w-12 mx-auto text-neutral-300 mb-3" />
                  <h3 className="font-medium mb-1">Grow Your Following</h3>
                  <p className="text-sm text-muted-foreground mb-4">Log more flavors and engage with the community</p>
                  <Button asChild>
                    <Link href="/dashboard/leaderboard">
                      <Award className="h-4 w-4 mr-2" />
                      View Leaderboard
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
