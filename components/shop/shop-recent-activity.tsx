"use client"

import { useEffect, useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IceCream, MapPin, Star, Heart, User, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

interface ShopRecentActivityProps {
  shopId: string
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
}

export function ShopRecentActivity({ shopId }: ShopRecentActivityProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchActivities() {
      setLoading(true)

      try {
        // In a real implementation, you would fetch actual shop activity data
        // This is a placeholder that simulates fetching data

        // Simulate API call delay
        await new Promise((resolve) => setTimeout(resolve, 1000))

        // Mock data
        const mockActivities = [
          {
            id: "1",
            type: "check_in",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            details: {},
            user: {
              username: "alexj",
              avatar_url: null,
            },
          },
          {
            id: "2",
            type: "flavor_log",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
            details: {
              flavor_name: "Vanilla Bean",
              rating: 4.5,
            },
            user: {
              username: "samsmith",
              avatar_url: null,
            },
          },
          {
            id: "3",
            type: "review",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(), // 8 hours ago
            details: {
              rating: 5,
              comment: "Best ice cream shop in town!",
            },
            user: {
              username: "taylorw",
              avatar_url: null,
            },
          },
          {
            id: "4",
            type: "follow",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
            details: {},
            user: {
              username: "jlee",
              avatar_url: null,
            },
          },
          {
            id: "5",
            type: "flavor_log",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            details: {
              flavor_name: "Chocolate Fudge",
              rating: 4.8,
            },
            user: {
              username: "cmorgan",
              avatar_url: null,
            },
          },
          {
            id: "6",
            type: "check_in",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 25).toISOString(), // 25 hours ago
            details: {},
            user: {
              username: "alexj",
              avatar_url: null,
            },
          },
          {
            id: "7",
            type: "review",
            created_at: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(), // 36 hours ago
            details: {
              rating: 4,
              comment: "Great flavors, friendly staff!",
            },
            user: {
              username: "samsmith",
              avatar_url: null,
            },
          },
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error("Error fetching shop activities:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [shopId, supabase])

  // Get activity icon based on type
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "flavor_log":
        return <IceCream className="h-4 w-4" />
      case "check_in":
        return <MapPin className="h-4 w-4" />
      case "review":
        return <Star className="h-4 w-4" />
      case "follow":
        return <Heart className="h-4 w-4" />
      case "comment":
        return <MessageSquare className="h-4 w-4" />
      default:
        return <User className="h-4 w-4" />
    }
  }

  // Get activity color based on type
  const getActivityColor = (type: string) => {
    switch (type) {
      case "flavor_log":
        return "bg-orange-500"
      case "check_in":
        return "bg-purple-500"
      case "review":
        return "bg-yellow-500"
      case "follow":
        return "bg-red-500"
      case "comment":
        return "bg-blue-500"
      default:
        return "bg-gray-500"
    }
  }

  // Get activity message based on type and details
  const getActivityMessage = (activity: ActivityItem) => {
    const { type, details, user } = activity

    switch (type) {
      case "flavor_log":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> logged{" "}
            <span className="font-medium">{details?.flavor_name || "a flavor"}</span>
            {details?.rating && (
              <span className="inline-flex items-center ml-1">
                and rated it <Star className="h-3 w-3 text-yellow-500 mx-1" />
                {details.rating}
              </span>
            )}
          </span>
        )
      case "check_in":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> checked in at your shop
          </span>
        )
      case "review":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> left a{" "}
            <span className="inline-flex items-center">
              <Star className="h-3 w-3 text-yellow-500 mx-1" />
              {details?.rating || "5"}
            </span>{" "}
            review
            {details?.comment && <span className="block mt-1 text-xs italic">"{details.comment}"</span>}
          </span>
        )
      case "follow":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> followed your shop
          </span>
        )
      case "comment":
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> commented on your shop
            {details?.comment && <span className="block mt-1 text-xs italic">"{details.comment}"</span>}
          </span>
        )
      default:
        return (
          <span>
            <span className="font-medium">{user?.username || "Someone"}</span> interacted with your shop
          </span>
        )
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Recent customer interactions with your shop</CardDescription>
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
        <CardDescription>Recent customer interactions with your shop</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Activity</TabsTrigger>
            <TabsTrigger value="check_ins">Check-ins</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="flavors">Flavor Logs</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {activities.length > 0 ? (
              activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0"
                >
                  <div className={cn("p-2 rounded-full text-white", getActivityColor(activity.type))}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm">{getActivityMessage(activity)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={activity.user?.avatar_url || `https://avatar.vercel.sh/${activity.user?.username}.png`}
                      alt={activity.user?.username}
                    />
                    <AvatarFallback>{activity.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                  </Avatar>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-neutral-100 p-3 mb-4">
                  <User className="h-6 w-6 text-neutral-500" />
                </div>
                <h3 className="font-medium mb-1">No activity yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  When customers interact with your shop, their activity will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="check_ins" className="space-y-4">
            {activities.filter((a) => a.type === "check_in").length > 0 ? (
              activities
                .filter((a) => a.type === "check_in")
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0"
                  >
                    <div className={cn("p-2 rounded-full text-white", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{getActivityMessage(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.user?.avatar_url || `https://avatar.vercel.sh/${activity.user?.username}.png`}
                        alt={activity.user?.username}
                      />
                      <AvatarFallback>{activity.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-neutral-100 p-3 mb-4">
                  <MapPin className="h-6 w-6 text-neutral-500" />
                </div>
                <h3 className="font-medium mb-1">No check-ins yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  When customers check in at your shop, their activity will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4">
            {activities.filter((a) => a.type === "review").length > 0 ? (
              activities
                .filter((a) => a.type === "review")
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0"
                  >
                    <div className={cn("p-2 rounded-full text-white", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{getActivityMessage(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.user?.avatar_url || `https://avatar.vercel.sh/${activity.user?.username}.png`}
                        alt={activity.user?.username}
                      />
                      <AvatarFallback>{activity.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-neutral-100 p-3 mb-4">
                  <Star className="h-6 w-6 text-neutral-500" />
                </div>
                <h3 className="font-medium mb-1">No reviews yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  When customers review your shop, their reviews will appear here.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="flavors" className="space-y-4">
            {activities.filter((a) => a.type === "flavor_log").length > 0 ? (
              activities
                .filter((a) => a.type === "flavor_log")
                .map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 pb-4 border-b border-neutral-100 last:border-0"
                  >
                    <div className={cn("p-2 rounded-full text-white", getActivityColor(activity.type))}>
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm">{getActivityMessage(activity)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={activity.user?.avatar_url || `https://avatar.vercel.sh/${activity.user?.username}.png`}
                        alt={activity.user?.username}
                      />
                      <AvatarFallback>{activity.user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="rounded-full bg-neutral-100 p-3 mb-4">
                  <IceCream className="h-6 w-6 text-neutral-500" />
                </div>
                <h3 className="font-medium mb-1">No flavor logs yet</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  When customers log flavors from your shop, their logs will appear here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
