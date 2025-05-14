import { createServerClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { IceCream, MapPin, Award, PlusCircle } from "lucide-react"
import PersonalFlavorCollection from "@/components/flavor/personal-flavor-collection"
import VisitedShops from "@/components/shop/visited-shops"
import UserAchievements from "@/components/user/user-achievements"
import PersonalStats from "@/components/user/personal-stats"

// Demo user data
const demoUsers = {
  "admin@conedex.app": {
    email: "admin@conedex.app",
    role: "admin",
    id: "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6",
  },
  "shopowner@conedex.app": {
    email: "shopowner@conedex.app",
    role: "shop_owner",
    id: "f5c0d6e7-2e4b-5d7c-8f9a-1b2c3d4e5f6a",
  },
  "explorer@conedex.app": {
    email: "explorer@conedex.app",
    role: "explorer",
    id: "e4b9c5f8-1d3a-4c6b-9e2f-a8b7c6d5e4f3",
  },
}

export default async function MyConeDexPage() {
  // Default values for when data can't be fetched
  let user = null
  let flavorLogsCount = 0
  let uniqueShopsCount = 0
  let badgesCount = 0
  let totalFlavorsCount = 150 // Default total flavors
  let collectionProgress = 0
  let isDemoUser = false

  try {
    // Check for demo user in cookies
    const cookieStore = cookies()
    const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
    isDemoUser = !!demoUserEmail && !!demoUsers[demoUserEmail as keyof typeof demoUsers]

    if (isDemoUser) {
      // Use demo data
      user = demoUsers[demoUserEmail as keyof typeof demoUsers]
      flavorLogsCount = 24
      uniqueShopsCount = 8
      badgesCount = 5
      totalFlavorsCount = 150
      collectionProgress = Math.round((flavorLogsCount / totalFlavorsCount) * 100)
    } else {
      try {
        const supabase = createServerClient()

        // Get real user data
        const {
          data: { user: authUser },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !authUser) {
          throw new Error("User not authenticated")
        }

        user = authUser

        // Get flavor logs count - with error handling
        try {
          const { count: logsCount, error: logsError } = await supabase
            .from("flavor_logs")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          if (!logsError) {
            flavorLogsCount = logsCount || 0
          }
        } catch (error) {
          console.error("Error fetching flavor logs count:", error)
        }

        // Get unique shops visited - with error handling
        try {
          const { data: shopsVisited, error: shopsError } = await supabase
            .from("flavor_logs")
            .select("shop_id")
            .eq("user_id", user.id)
            .limit(1000)

          if (!shopsError && shopsVisited) {
            uniqueShopsCount = [...new Set(shopsVisited.map((log) => log.shop_id))].length
          }
        } catch (error) {
          console.error("Error fetching shops visited:", error)
        }

        // Get badges count - with error handling
        try {
          const { count: userBadgesCount, error: badgesError } = await supabase
            .from("user_badges")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user.id)

          if (!badgesError) {
            badgesCount = userBadgesCount || 0
          }
        } catch (error) {
          console.error("Error fetching badges count:", error)
        }

        // Get total flavors in system for progress calculation - with error handling
        try {
          const { count: systemFlavorsCount, error: flavorsError } = await supabase
            .from("flavors")
            .select("*", { count: "exact", head: true })

          if (!flavorsError) {
            totalFlavorsCount = systemFlavorsCount || 150
          }
        } catch (error) {
          console.error("Error fetching total flavors count:", error)
        }

        collectionProgress = totalFlavorsCount > 0 ? Math.round((flavorLogsCount / totalFlavorsCount) * 100) : 0
      } catch (error) {
        console.error("Error in MyConeDexPage:", error)
        // Keep default values
      }
    }
  } catch (error) {
    console.error("Error in MyConeDexPage:", error)
    // Keep default values
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My ConeDex</h1>
          <p className="text-muted-foreground">Your personal ice cream collection and journey</p>
        </div>

        <Button asChild>
          <Link href="/dashboard/log-flavor">
            <PlusCircle className="mr-2 h-4 w-4" />
            Log New Flavor
          </Link>
        </Button>
      </div>

      {/* Collection Progress */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Collection Progress</CardTitle>
          <CardDescription>
            You've discovered {flavorLogsCount} out of {totalFlavorsCount} flavors ({collectionProgress}%)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={collectionProgress} className="h-2" />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="flex items-center gap-4">
              <div className="bg-pink-100 p-3 rounded-full">
                <IceCream className="h-6 w-6 text-pink-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Flavors Logged</p>
                <h3 className="text-2xl font-bold">{flavorLogsCount}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <MapPin className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Shops Visited</p>
                <h3 className="text-2xl font-bold">{uniqueShopsCount}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-amber-100 p-3 rounded-full">
                <Award className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Badges Earned</p>
                <h3 className="text-2xl font-bold">{badgesCount}</h3>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs for different sections */}
      <Tabs defaultValue="flavors" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flavors">My Flavors</TabsTrigger>
          <TabsTrigger value="shops">Visited Shops</TabsTrigger>
          <TabsTrigger value="badges">Badges & Quests</TabsTrigger>
          <TabsTrigger value="stats">Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="flavors" className="mt-6">
          <PersonalFlavorCollection userId={user?.id} isDemoUser={!!isDemoUser} />
        </TabsContent>

        <TabsContent value="shops" className="mt-6">
          <VisitedShops userId={user?.id} isDemoUser={!!isDemoUser} />
        </TabsContent>

        <TabsContent value="badges" className="mt-6">
          <UserAchievements />
        </TabsContent>

        <TabsContent value="stats" className="mt-6">
          <PersonalStats userId={user?.id} isDemoUser={!!isDemoUser} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
