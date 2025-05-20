"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Award, Users, RefreshCw } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { getRecentlyCompletedQuests } from "@/app/actions/quest-actions"
import { ScrollArea } from "@/components/ui/scroll-area"

export function CommunityActivityFeed() {
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadActivities()
  }, [])

  async function loadActivities() {
    setLoading(true)
    const { data, error } = await getRecentlyCompletedQuests(10)

    if (error) {
      toast({
        title: "Error loading activity feed",
        description: error,
        variant: "destructive",
      })
    } else if (data) {
      setActivities(data)
    }

    setLoading(false)
  }

  const handleRefresh = () => {
    loadActivities()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Community Activity</CardTitle>
          <CardDescription>See what other explorers are achieving</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle>Community Activity</CardTitle>
            <CardDescription>See what other explorers are achieving</CardDescription>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Users className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No recent activity to display</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="space-y-1 p-1">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 rounded-lg border border-muted hover:bg-muted/50 transition-colors"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={activity.profiles?.avatar_url || "/placeholder.svg"}
                      alt={activity.profiles?.username || "User"}
                    />
                    <AvatarFallback>
                      {(activity.profiles?.username || "U").substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium line-clamp-1">
                          <Link
                            href={`/explorers/${activity.profiles?.username}`}
                            className="hover:underline font-semibold"
                          >
                            {activity.profiles?.username || "Explorer"}
                          </Link>{" "}
                          completed a quest
                        </p>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {activity.quest?.title || "Unknown Quest"}
                        </p>
                      </div>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Award className="h-3 w-3" />
                        <span>{activity.quest?.difficulty || "Normal"}</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.completed_at), { addSuffix: true })}
                      </p>
                      {activity.quest?.points && (
                        <Badge variant="secondary" className="text-xs">
                          {activity.quest.points} points
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="border-t bg-muted/50 p-3">
        <Button variant="ghost" size="sm" className="w-full" asChild>
          <Link href="/dashboard/leaderboard">View Leaderboard</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
