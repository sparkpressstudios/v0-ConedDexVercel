"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IceCream, MapPin, Award, Trophy, Store, Heart, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface RecentActivityProps {
  userId: string
}

type ActivityItem = {
  id: string
  type: string
  created_at: string
  details: any
  user?: {
    username: string
    avatar_url: string
  }
  shop?: {
    name: string
    image_url: string
  }
  flavor?: {
    name: string
    color: string
  }
}

export function RecentActivity({ userId }: RecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true)

      try {
        // Fetch user's activities
        const { data: userActivities, error: userError } = await supabase
          .from("user_activities")
          .select(`
            id,
            type,
            created_at,
            details,
            profiles!user_id(username, avatar_url),
            shops(name, image_url),
            flavors(name, color)
          `)
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10)

        if (userError) throw userError

        // Fetch following activities
        const { data: followingIds, error: followingError } = await supabase
          .from("user_follows")
          .select("followed_id")
          .eq("follower_id", userId)

        if (followingError) throw followingError

        let followingActivities: any[] = []

        if (followingIds && followingIds.length > 0) {
          const followedUserIds = followingIds.map((f) => f.followed_id)

          const { data: followingActs, error: followingActsError } = await supabase
            .from("user_activities")
            .select(`
              id,
              type,
              created_at,
              details,
              profiles!user_id(username, avatar_url),
              shops(name, image_url),
              flavors(name, color)
            `)
            .in("user_id", followedUserIds)
            .order("created_at", { ascending: false })
            .limit(10)

          if (followingActsError) throw followingActsError

          followingActivities = followingActs || []
        }

        // Format the activities
        const formattedUserActivities = (userActivities || []).map((activity) => ({
          id: activity.id,
          type: activity.type,
          created_at: activity.created_at,
          details: activity.details,
          user: activity.profiles,
          shop: activity.shops,
          flavor: activity.flavors,
        }))

        const formattedFollowingActivities = followingActivities.map((activity) => ({
          id: activity.id,
          type: activity.type,
          created_at: activity.created_at,
          details: activity.details,
          user: activity.profiles,
          shop: activity.shops,
          flavor: activity.flavors,
        }))

        setActivities(formattedUserActivities)

        // Set all activities
        setActivities({
          personal: formattedUserActivities,
          following: formattedFollowingActivities,
          all: [...formattedUserActivities, ...formattedFollowingActivities]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, 10),
        })
      } catch (error) {
        console.error("Error fetching activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [userId, supabase])

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "flavor_log":
        return <IceCream className="h-4 w-4" />
      case "shop_checkin":
        return <MapPin className="h-4 w-4" />
      case "badge_earned":
        return <Award className="h-4 w-4" />
      case "quest_completed":
        return <Trophy className="h-4 w-4" />
      case "shop_followed":
        return <Heart className="h-4 w-4" />
      case "user_followed":
        return <User className="h-4 w-4" />
      case "shop_updated":
        return <Store className="h-4 w-4" />
      default:
        return <IceCream className="h-4 w-4" />
    }
  }

  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "flavor_log":
        return "bg-orange-500"
      case "shop_checkin":
        return "bg-purple-500"
      case "badge_earned":
        return "bg-yellow-500"
      case "quest_completed":
        return "bg-teal-500"
      case "shop_followed":
        return "bg-red-500"
      case "user_followed":
        return "bg-blue-500"
      case "shop_updated":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get activity message based on type and details
  const getActivityMessage = (activity: ActivityItem) => {
    const { type, details, user, shop, flavor } = activity

    switch (type) {
      case "flavor_log":
        return (
          <span>
            You logged <span className="font-medium">{flavor?.name || "a flavor"}</span> at{" "}
            <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      case "shop_checkin":
        return (
          <span>
            You checked in at <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      case "badge_earned":
        return (
          <span>
            You earned the <span className="font-medium">{details?.badge_name || "a badge"}</span> badge
          </span>
        )
      case "quest_completed":
        return (
          <span>
            You completed the <span className="font-medium">{details?.quest_name || "a quest"}</span> quest
          </span>
        )
      case "shop_followed":
        return (
          <span>
            You followed <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      case "user_followed":
        return (
          <span>
            You followed <span className="font-medium">{details?.followed_username || "a user"}</span>
          </span>
        )
      case "shop_updated":
        return (
          <span>
            You updated your shop <span className="font-medium">{shop?.name || "information"}</span>
          </span>
        )
      default:
        return <span>You performed an activity</span>
    }
  }

  // Get following activity message
  const getFollowingActivityMessage = (activity: ActivityItem) => {
    const { type, details, user, shop, flavor } = activity

    switch (type) {
      case "flavor_log":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> logged{" "}
            <span className="font-medium">{flavor?.name || "a flavor"}</span> at{" "}
            <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      case "shop_checkin":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> checked in at{" "}
            <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      case "badge_earned":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> earned the{" "}
            <span className="font-medium">{details?.badge_name || "a badge"}</span> badge
          </span>
        )
      case "quest_completed":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> completed the{" "}
            <span className="font-medium">{details?.quest_name || "a quest"}</span> quest
          </span>
        )
      case "shop_followed":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> followed{" "}
            <span className="font-medium">{shop?.name || "a shop"}</span>
          </span>
        )
      default:
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> performed an activity
          </span>
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your recent actions and achievements</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[400px] w-full" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Your recent actions and achievements</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="personal">
          <TabsList className="mb-4">
            <TabsTrigger value="personal">Your Activity</TabsTrigger>
            <TabsTrigger value="following">Following</TabsTrigger>
            <TabsTrigger value="all">All Activity</TabsTrigger>
          </TabsList>

          {["personal", "following", "all"].map((tab) => (
            <TabsContent key={tab} value={tab} className="space-y-4">
              {activities[tab]?.length > 0 ? (
                activities[tab].map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0"
                  >
                    <div className={cn("p-2 rounded-full text-white", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">
                        {tab === "personal" ? getActivityMessage(activity) : getFollowingActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    {tab !== "personal" && (
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={activity.user?.avatar_url || "/placeholder.svg"}
                          alt={activity.user?.username}
                        />
                        <AvatarFallback>{activity.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="rounded-full bg-neutral-100 p-3 mb-4">
                    <IceCream className="h-6 w-6 text-neutral-500" />
                  </div>
                  <h3 className="font-medium mb-1">No activity yet</h3>
                  <p className="text-sm text-muted-foreground max-w-md">
                    {tab === "personal"
                      ? "Start exploring shops, logging flavors, and completing quests to see your activity here."
                      : tab === "following"
                        ? "Follow other users to see their activity here."
                        : "There's no recent activity to show."}
                  </p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  )
}
