"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, IceCream, MapPin, Star } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export function UserAchievements() {
  const [achievements, setAchievements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchAchievements() {
      if (!user?.id) return

      try {
        setLoading(true)

        // Get user stats
        const { data: flavorLogs, error: logsError } = await supabase
          .from("flavor_logs")
          .select("flavor_id, shop_id")
          .eq("user_id", user.id)

        if (logsError) throw logsError

        // Calculate stats
        const uniqueFlavors = flavorLogs ? new Set(flavorLogs.map((log) => log.flavor_id)).size : 0
        const uniqueShops = flavorLogs ? new Set(flavorLogs.map((log) => log.shop_id).filter(Boolean)).size : 0
        const totalLogs = flavorLogs ? flavorLogs.length : 0

        // Create achievements based on stats
        const achievementsList = [
          {
            name: "Flavor Explorer",
            description: `Try ${Math.max(10, uniqueFlavors + 5)} different flavors`,
            progress:
              uniqueFlavors > 0 ? Math.min(Math.floor((uniqueFlavors / Math.max(10, uniqueFlavors + 5)) * 100), 90) : 0,
            icon: <IceCream className="h-5 w-5" />,
          },
          {
            name: "Shop Hopper",
            description: `Visit ${Math.max(5, uniqueShops + 2)} different shops`,
            progress:
              uniqueShops > 0 ? Math.min(Math.floor((uniqueShops / Math.max(5, uniqueShops + 2)) * 100), 90) : 0,
            icon: <MapPin className="h-5 w-5" />,
          },
          {
            name: "Review Master",
            description: "Leave 15 detailed reviews",
            progress: Math.min(Math.floor((totalLogs / 15) * 100), 90),
            icon: <Star className="h-5 w-5" />,
          },
        ]

        setAchievements(achievementsList)
      } catch (error) {
        console.error("Error calculating achievements:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAchievements()
  }, [supabase, user?.id])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Achievements</CardTitle>
        <CardDescription>Track your ice cream journey progress</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
          </div>
        ) : achievements.length > 0 ? (
          <div className="space-y-4">
            {achievements.map((achievement, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-purple-100">{achievement.icon}</div>
                    <div>
                      <p className="font-medium">{achievement.name}</p>
                      <p className="text-xs text-gray-500">{achievement.description}</p>
                    </div>
                  </div>
                  <Badge variant="outline">{achievement.progress}%</Badge>
                </div>
                <Progress value={achievement.progress} className="h-2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Award className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No achievements yet</p>
            <p className="text-sm text-muted-foreground mt-1">Start your ice cream journey to earn achievements</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button asChild variant="outline" className="w-full">
          <Link href="/dashboard/badges">View All Badges</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

export default UserAchievements
