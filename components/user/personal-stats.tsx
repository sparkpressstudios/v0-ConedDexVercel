"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, IceCream, MapPin, Star, Trophy } from "lucide-react"

type UserStats = {
  flavorsLogged: number
  shopsVisited: number
  averageRating: number
  achievementsCompleted: number
}

export function PersonalStatsComponent() {
  const [stats, setStats] = useState<UserStats>({
    flavorsLogged: 0,
    shopsVisited: 0,
    averageRating: 0,
    achievementsCompleted: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function loadUserStats() {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError("User not authenticated")
          setLoading(false)
          return
        }

        // Get flavors logged count
        const { count: flavorsCount, error: flavorsError } = await supabase
          .from("user_flavor_logs")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (flavorsError) {
          throw new Error(flavorsError.message)
        }

        // Get unique shops visited count
        const { data: shopsData, error: shopsError } = await supabase
          .from("user_shop_visits")
          .select("shop_id")
          .eq("user_id", user.id)

        if (shopsError) {
          throw new Error(shopsError.message)
        }

        const uniqueShops = new Set(shopsData?.map((visit) => visit.shop_id))

        // Get average rating
        const { data: ratingsData, error: ratingsError } = await supabase
          .from("user_flavor_logs")
          .select("rating")
          .eq("user_id", user.id)
          .not("rating", "is", null)

        if (ratingsError) {
          throw new Error(ratingsError.message)
        }

        const ratings = ratingsData?.map((log) => log.rating).filter(Boolean) as number[]
        const averageRating =
          ratings.length > 0
            ? Number.parseFloat((ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length).toFixed(1))
            : 0

        // Get completed achievements count
        const { count: achievementsCount, error: achievementsError } = await supabase
          .from("user_achievements")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)
          .eq("completed", true)

        if (achievementsError) {
          throw new Error(achievementsError.message)
        }

        setStats({
          flavorsLogged: flavorsCount || 0,
          shopsVisited: uniqueShops.size,
          averageRating,
          achievementsCompleted: achievementsCount || 0,
        })
      } catch (err) {
        console.error("Error loading user stats:", err)
        setError(err instanceof Error ? err.message : "Failed to load user stats")
      } finally {
        setLoading(false)
      }
    }

    loadUserStats()
  }, [supabase])

  const statItems = [
    {
      label: "Flavors Logged",
      value: stats.flavorsLogged,
      icon: <IceCream className="h-4 w-4" />,
    },
    {
      label: "Shops Visited",
      value: stats.shopsVisited,
      icon: <MapPin className="h-4 w-4" />,
    },
    {
      label: "Avg. Rating",
      value: stats.averageRating,
      icon: <Star className="h-4 w-4" />,
    },
    {
      label: "Achievements",
      value: stats.achievementsCompleted,
      icon: <Trophy className="h-4 w-4" />,
    },
  ]

  return (
    <Card>
      <CardContent className="p-6">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center justify-center">
                <Skeleton className="h-8 w-8 rounded-full mb-2" />
                <Skeleton className="h-5 w-12 mb-1" />
                <Skeleton className="h-4 w-20" />
              </div>
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            {statItems.map((item) => (
              <div key={item.label} className="flex flex-col items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  {item.icon}
                </div>
                <span className="text-2xl font-bold">{item.value}</span>
                <span className="text-xs text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Add default export
export default function PersonalStats() {
  return <PersonalStatsComponent />
}
