import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Award, Lock, TrendingUp, Star } from "lucide-react"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

// Mark this page as dynamic to allow cookies usage
export const dynamic = "force-dynamic"

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

// Demo badges data
const demoBadges = [
  {
    id: "badge_1",
    name: "Flavor Explorer",
    description: "Log your first ice cream flavor",
    image_url: "/placeholder.svg?key=iwhlw",
    rarity: "Common",
    earned: true,
    progress: 100,
    total_required: 1,
    current_progress: 1,
    category: "exploration",
    earned_date: "2023-08-15T14:30:00Z",
  },
  {
    id: "badge_2",
    name: "Flavor Enthusiast",
    description: "Log 10 different ice cream flavors",
    image_url: "/placeholder.svg?key=w1oh7",
    rarity: "Uncommon",
    earned: false,
    progress: 40,
    total_required: 10,
    current_progress: 4,
    category: "exploration",
  },
  {
    id: "badge_3",
    name: "Flavor Connoisseur",
    description: "Log 25 different ice cream flavors",
    image_url: "/placeholder.svg?key=gkgko",
    rarity: "Rare",
    earned: false,
    progress: 16,
    total_required: 25,
    current_progress: 4,
    category: "exploration",
  },
  {
    id: "badge_4",
    name: "Shop Explorer",
    description: "Visit 5 different ice cream shops",
    image_url: "/placeholder.svg?key=adgug",
    rarity: "Uncommon",
    earned: false,
    progress: 40,
    total_required: 5,
    current_progress: 2,
    category: "shops",
  },
  {
    id: "badge_5",
    name: "Chocolate Lover",
    description: "Log 5 different chocolate-based flavors",
    image_url: "/placeholder.svg?key=uq6f4",
    rarity: "Common",
    earned: true,
    progress: 100,
    total_required: 5,
    current_progress: 5,
    category: "flavors",
    earned_date: "2023-09-02T10:15:00Z",
  },
  {
    id: "badge_6",
    name: "Fruit Fanatic",
    description: "Log 5 different fruit-based flavors",
    image_url: "/placeholder.svg?key=kr7pe",
    rarity: "Common",
    earned: false,
    progress: 60,
    total_required: 5,
    current_progress: 3,
    category: "flavors",
  },
  {
    id: "badge_7",
    name: "Social Butterfly",
    description: "Join a team and complete a team challenge",
    image_url: "/placeholder.svg?key=social",
    rarity: "Uncommon",
    earned: false,
    progress: 0,
    total_required: 1,
    current_progress: 0,
    category: "social",
  },
  {
    id: "badge_8",
    name: "Seasonal Taster",
    description: "Try a limited edition seasonal flavor",
    image_url: "/placeholder.svg?key=seasonal",
    rarity: "Rare",
    earned: true,
    progress: 100,
    total_required: 1,
    current_progress: 1,
    category: "special",
    earned_date: "2023-10-12T16:45:00Z",
  },
]

// Badge rarity colors
const rarityColors = {
  Common: "bg-slate-100 text-slate-800",
  Uncommon: "bg-green-100 text-green-800",
  Rare: "bg-blue-100 text-blue-800",
  Epic: "bg-purple-100 text-purple-800",
  Legendary: "bg-amber-100 text-amber-800",
}

export default async function BadgesPage() {
  // Create the Supabase client directly in the component
  const supabase = createServerComponentClient<Database>({ cookies })

  // Check for demo user in cookies
  const cookieStore = cookies()
  const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
  const isDemoUser = demoUserEmail && demoUsers[demoUserEmail as keyof typeof demoUsers]

  let userBadges = []
  let availableBadges = []

  if (isDemoUser) {
    // Use demo data
    userBadges = demoBadges.filter((badge) => badge.earned)
    availableBadges = demoBadges.filter((badge) => !badge.earned)
  } else {
    // Get real user data
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        redirect: {
          destination: "/login",
          permanent: false,
        },
      }
    }

    // Get user badges
    const { data: userBadgesData } = await supabase
      .from("user_badges")
      .select(`
        *,
        badges:badge_id (id, name, description, image_url, rarity, category)
      `)
      .eq("user_id", user.id)
      .order("awarded_at", { ascending: false })

    userBadges = userBadgesData || []

    // Get available badges (not yet earned)
    const { data: allBadges } = await supabase.from("badges").select("*").order("name")

    const earnedBadgeIds = new Set(userBadges.map((ub) => ub.badge_id))
    availableBadges = (allBadges || [])
      .filter((badge) => !earnedBadgeIds.has(badge.id))
      .map((badge) => ({
        ...badge,
        progress: Math.floor(Math.random() * 80), // Simulate progress for demo
        earned: false,
      }))
  }

  // Calculate badge stats
  const totalBadges = userBadges.length + availableBadges.length
  const earnedPercentage = Math.round((userBadges.length / totalBadges) * 100) || 0

  // Group badges by category
  const categories = [
    { id: "all", name: "All Badges" },
    { id: "exploration", name: "Exploration" },
    { id: "shops", name: "Shops" },
    { id: "flavors", name: "Flavors" },
    { id: "social", name: "Social" },
    { id: "special", name: "Special" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Badges</h1>
          <p className="text-muted-foreground">Track your achievements and unlock new badges</p>
        </div>
        <Card className="w-full sm:w-auto">
          <CardContent className="flex items-center gap-4 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium">Badge Progress</p>
              <div className="mt-1 flex items-center gap-2">
                <Progress value={earnedPercentage} className="h-2 w-24" />
                <span className="text-xs font-medium">
                  {userBadges.length}/{totalBadges}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <div className="mb-4 overflow-x-auto">
          <TabsList className="inline-flex w-auto">
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id} className="min-w-[100px]">
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {categories.map((category) => (
          <TabsContent key={category.id} value={category.id} className="space-y-6">
            {userBadges.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500" />
                    Earned Badges
                  </h2>
                  <Badge variant="outline" className="font-normal">
                    {
                      userBadges.filter(
                        (badge) =>
                          category.id === "all" ||
                          (isDemoUser ? badge.category === category.id : badge.badges.category === category.id),
                      ).length
                    }{" "}
                    badges
                  </Badge>
                </div>
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                  {userBadges
                    .filter(
                      (badge) =>
                        category.id === "all" ||
                        (isDemoUser ? badge.category === category.id : badge.badges.category === category.id),
                    )
                    .map((badge) => (
                      <Card
                        key={isDemoUser ? badge.id : badge.badges.id}
                        className="overflow-hidden transition-all hover:shadow-md"
                      >
                        <div className="flex items-center justify-center p-6 bg-gradient-to-b from-primary/5 to-primary/10">
                          <div className="h-20 w-20 rounded-full bg-background p-4 shadow-sm">
                            <img
                              src={
                                isDemoUser
                                  ? badge.image_url
                                  : badge.badges.image_url || "/placeholder.svg?height=100&width=100&query=badge icon"
                              }
                              alt={isDemoUser ? badge.name : badge.badges.name}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{isDemoUser ? badge.name : badge.badges.name}</CardTitle>
                            <Badge
                              variant="secondary"
                              className={
                                isDemoUser
                                  ? rarityColors[badge.rarity as keyof typeof rarityColors]
                                  : rarityColors[badge.badges.rarity as keyof typeof rarityColors] || "bg-slate-100"
                              }
                            >
                              {isDemoUser ? badge.rarity : badge.badges.rarity}
                            </Badge>
                          </div>
                          <CardDescription>{isDemoUser ? badge.description : badge.badges.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium text-green-600 flex items-center">
                              <TrendingUp className="h-3.5 w-3.5 mr-1" />
                              Completed!
                            </span>
                            <span>
                              {isDemoUser
                                ? new Date(badge.earned_date).toLocaleDateString()
                                : new Date(badge.awarded_at).toLocaleDateString()}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Lock className="h-5 w-5 text-muted-foreground" />
                  Available Badges
                </h2>
                <Badge variant="outline" className="font-normal">
                  {availableBadges.filter((badge) => category.id === "all" || badge.category === category.id).length}{" "}
                  badges
                </Badge>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {availableBadges
                  .filter((badge) => category.id === "all" || badge.category === category.id)
                  .map((badge) => (
                    <Card key={badge.id} className="overflow-hidden transition-all hover:shadow-md">
                      <div className="flex items-center justify-center p-6 bg-muted/50">
                        <div className="h-20 w-20 rounded-full bg-background/80 p-4 opacity-50">
                          <img
                            src={badge.image_url || "/placeholder.svg?height=100&width=100&query=badge icon"}
                            alt={badge.name}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </div>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{badge.name}</CardTitle>
                          <Badge
                            variant="outline"
                            className={rarityColors[badge.rarity as keyof typeof rarityColors] || "bg-slate-100"}
                          >
                            {badge.rarity}
                          </Badge>
                        </div>
                        <CardDescription>{badge.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">
                              {badge.current_progress || 0}/{badge.total_required}
                            </span>
                          </div>
                          <Progress value={badge.progress} className="h-2" />
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
