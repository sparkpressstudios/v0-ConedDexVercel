import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  IceCream,
  MapPin,
  Star,
  Compass,
  TrendingUp,
  Users,
  Calendar,
  ChevronRight,
  ChevronLeft,
  Search,
  Award,
  ThumbsUp,
  Camera,
  Heart,
  Zap,
  Thermometer,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerClient()

  let user = null
  let profile = null

  try {
    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser

    if (user) {
      // Get the user's profile
      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()
      profile = userProfile
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Get current date
  const today = new Date()
  const currentMonth = today.toLocaleString("default", { month: "long" })
  const currentDay = today.getDate()
  const currentYear = today.getFullYear()

  // Create week dates
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const currentDayOfWeek = today.getDay() // 0 is Sunday, 1 is Monday, etc.
  const startOfWeek = new Date(today)
  startOfWeek.setDate(today.getDate() - ((currentDayOfWeek || 7) - 1)) // Adjust to Monday

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(startOfWeek)
    date.setDate(startOfWeek.getDate() + i)
    return {
      day: weekDays[i],
      date: date.getDate(),
      isToday:
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear(),
    }
  })

  // Sample data for flavor recommendations
  const flavorRecommendations = [
    {
      name: "Strawberry Cheesecake",
      shop: "Scoops Ahoy",
      rating: 4.8,
      image: "/strawberry-ice-cream-scoop.png",
    },
    {
      name: "Mint Chocolate Chip",
      shop: "Frozen Delights",
      rating: 4.7,
      image: "/mint-chocolate-chip-scoop.png",
    },
    {
      name: "Salted Caramel",
      shop: "Sweet Treats",
      rating: 4.9,
      image: "/chocolate-ice-cream-scoop.png",
    },
  ]

  // Sample data for nearby shops
  const nearbyShops = [
    {
      name: "Scoops Ahoy",
      distance: 0.8,
      flavors: 24,
      rating: 4.5,
    },
    {
      name: "Frozen Delights",
      distance: 1.2,
      flavors: 18,
      rating: 4.3,
    },
    {
      name: "Sweet Treats",
      distance: 1.5,
      flavors: 30,
      rating: 4.7,
    },
  ]

  // Sample data for achievements
  const achievements = [
    {
      name: "Flavor Explorer",
      description: "Try 10 different flavors",
      progress: 80,
      icon: <IceCream className="h-5 w-5" />,
    },
    {
      name: "Shop Hopper",
      description: "Visit 5 different shops",
      progress: 60,
      icon: <MapPin className="h-5 w-5" />,
    },
    {
      name: "Review Master",
      description: "Leave 15 detailed reviews",
      progress: 40,
      icon: <Star className="h-5 w-5" />,
    },
  ]

  // Sample data for taste profile
  const tasteProfile = {
    sweet: 75,
    creamy: 60,
    fruity: 45,
    nutty: 30,
    chocolate: 85,
  }

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 p-6 text-white shadow-lg">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-white/50">
              <AvatarImage src={profile?.avatar_url || "/placeholder.svg"} alt={profile?.username || "User"} />
              <AvatarFallback className="bg-white/20 text-white">
                {profile?.username?.substring(0, 2).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Hello, {profile?.full_name || profile?.username || "Explorer"}!
              </h1>
              <p className="mt-1 text-white/80">Welcome back to ConeDex</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
              <Link href="/dashboard/log-flavor">
                <IceCream className="mr-2 h-4 w-4" />
                Log Flavor
              </Link>
            </Button>
            <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20">
              <Link href="/dashboard/shops/map">
                <MapPin className="mr-2 h-4 w-4" />
                Find Shops
              </Link>
            </Button>
          </div>
        </div>

        {/* Decorative ice cream cone illustration */}
        <div className="absolute -bottom-10 right-10 h-32 w-32 opacity-20">
          <Image
            src="/colorful-ice-cream-cones.png"
            alt="Ice Cream Cones"
            width={128}
            height={128}
            className="object-contain"
          />
        </div>
      </div>

      {/* Date Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <h2 className="text-lg font-medium text-gray-700">
            {currentMonth} {currentDay}-{currentDay + 6}
          </h2>
          <div className="flex items-center space-x-1">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <Button variant="outline" className="text-sm">
          <Calendar className="mr-2 h-4 w-4" />
          Month
        </Button>
      </div>

      {/* Week Calendar */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {weekDates.map((item) => (
          <div key={item.day} className="flex flex-col items-center">
            <span className="text-sm text-gray-500">{item.day}</span>
            <div
              className={cn(
                "mt-1 flex h-8 w-8 items-center justify-center rounded-full text-sm",
                item.isToday ? "bg-coral-500 text-white" : "text-gray-700",
              )}
            >
              {item.date}
            </div>
            <div className="mt-1 h-1 w-1 rounded-full bg-orange-500"></div>
          </div>
        ))}
      </div>

      {/* Ice Cream Stats */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Your Ice Cream Journey</h2>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm" className="text-sm text-gray-500">
              Today
            </Button>
            <Button variant="ghost" size="sm" className="text-sm font-medium text-purple-600">
              Week
            </Button>
            <Button variant="ghost" size="sm" className="text-sm text-gray-500">
              Month
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-orange-100 rounded-lg">
                  <IceCream className="h-6 w-6 text-orange-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Flavors Logged</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">35</p>
                <p className="text-xs text-green-600 mt-1">+3 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-coral-100 rounded-lg">
                  <MapPin className="h-6 w-6 text-coral-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Shops Visited</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">12</p>
                <p className="text-xs text-green-600 mt-1">+1 this week</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-teal-100 rounded-lg">
                  <Award className="h-6 w-6 text-teal-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Badges Earned</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">8</p>
                <p className="text-xs text-orange-600 mt-1">2 in progress</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="mb-3 p-3 bg-purple-100 rounded-lg">
                  <TrendingUp className="h-6 w-6 text-purple-500" />
                </div>
                <h3 className="text-sm font-medium text-gray-600">Leaderboard Rank</h3>
                <p className="text-2xl font-bold mt-1 text-gray-900">#42</p>
                <p className="text-xs text-green-600 mt-1">Up 3 spots</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Explorer Tools */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Explorer Tools</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border border-gray-100 shadow-sm bg-coral-50">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-coral-500 rounded-lg text-white mb-3">
                  <Search className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-800">Flavor Finder</span>
                <p className="text-xs text-gray-500 mt-1">Discover new flavors</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm bg-orange-50">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-orange-500 rounded-lg text-white mb-3">
                  <Compass className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-800">Shop Radar</span>
                <p className="text-xs text-gray-500 mt-1">Find nearby shops</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm bg-teal-50">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-teal-500 rounded-lg text-white mb-3">
                  <ThumbsUp className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-800">Taste Matcher</span>
                <p className="text-xs text-gray-500 mt-1">Personalized recommendations</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-100 shadow-sm bg-purple-50">
            <CardContent className="p-4">
              <div className="flex flex-col items-center text-center">
                <div className="p-2 bg-purple-500 rounded-lg text-white mb-3">
                  <Camera className="h-5 w-5" />
                </div>
                <span className="font-medium text-gray-800">Flavor Snap</span>
                <p className="text-xs text-gray-500 mt-1">Share your discoveries</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Flavor Recommendations and Nearby Shops */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Heart className="mr-2 h-5 w-5 text-coral-500" />
              Recommended Flavors
            </CardTitle>
            <CardDescription>Based on your taste preferences</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {flavorRecommendations.map((flavor, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src={flavor.image || "/placeholder.svg"}
                      alt={flavor.name}
                      width={48}
                      height={48}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{flavor.name}</p>
                    <p className="text-sm text-gray-500 truncate">at {flavor.shop}</p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{flavor.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/conedex">View All Flavors</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <MapPin className="mr-2 h-5 w-5 text-orange-500" />
              Nearby Ice Cream Shops
            </CardTitle>
            <CardDescription>Discover shops in your area</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nearbyShops.map((shop, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="p-2 rounded-md bg-orange-100 flex-shrink-0">
                    <MapPin className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{shop.name}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {shop.distance} miles • {shop.flavors} flavors
                    </p>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{shop.rating}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/shops/map">Open Map View</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Achievements and Taste Profile */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Award className="mr-2 h-5 w-5 text-purple-500" />
              Achievements In Progress
            </CardTitle>
            <CardDescription>Complete these to earn badges</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/badges">View All Achievements</Link>
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-gray-800">
              <Zap className="mr-2 h-5 w-5 text-teal-500" />
              Your Taste Profile
            </CardTitle>
            <CardDescription>Based on your flavor history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Sweet</span>
                  <span className="text-sm text-gray-500">{tasteProfile.sweet}%</span>
                </div>
                <Progress value={tasteProfile.sweet} className="h-2 bg-gray-100">
                  <div className="h-full bg-orange-400 rounded-full" style={{ width: `${tasteProfile.sweet}%` }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Creamy</span>
                  <span className="text-sm text-gray-500">{tasteProfile.creamy}%</span>
                </div>
                <Progress value={tasteProfile.creamy} className="h-2 bg-gray-100">
                  <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${tasteProfile.creamy}%` }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Fruity</span>
                  <span className="text-sm text-gray-500">{tasteProfile.fruity}%</span>
                </div>
                <Progress value={tasteProfile.fruity} className="h-2 bg-gray-100">
                  <div className="h-full bg-pink-400 rounded-full" style={{ width: `${tasteProfile.fruity}%` }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nutty</span>
                  <span className="text-sm text-gray-500">{tasteProfile.nutty}%</span>
                </div>
                <Progress value={tasteProfile.nutty} className="h-2 bg-gray-100">
                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${tasteProfile.nutty}%` }} />
                </Progress>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Chocolate</span>
                  <span className="text-sm text-gray-500">{tasteProfile.chocolate}%</span>
                </div>
                <Progress value={tasteProfile.chocolate} className="h-2 bg-gray-100">
                  <div className="h-full bg-brown-400 rounded-full" style={{ width: `${tasteProfile.chocolate}%` }} />
                </Progress>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/profile">View Full Profile</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      {/* Seasonal Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-gray-800">
            <Thermometer className="mr-2 h-5 w-5 text-coral-500" />
            Seasonal Flavor Trends
          </CardTitle>
          <CardDescription>What's popular this season</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="trending">
            <TabsList className="mb-4">
              <TabsTrigger value="trending">Trending Now</TabsTrigger>
              <TabsTrigger value="seasonal">Seasonal Specials</TabsTrigger>
              <TabsTrigger value="community">Community Favorites</TabsTrigger>
            </TabsList>
            <TabsContent value="trending">
              <div className="h-[200px] flex items-end justify-between space-x-2">
                {["Strawberry", "Chocolate", "Vanilla", "Mint Chip", "Cookie", "Mango", "Coffee"].map((flavor, i) => {
                  const height = 30 + Math.floor(Math.random() * 60)
                  return (
                    <div key={flavor} className="flex flex-col items-center flex-1">
                      <div
                        className={`w-full rounded-t-sm ${flavor === "Mint Chip" ? "bg-orange-500" : "bg-teal-400"}`}
                        style={{ height: `${height}%` }}
                      ></div>
                      <span className="text-xs text-gray-500 mt-2 truncate w-full text-center">{flavor}</span>
                    </div>
                  )
                })}
              </div>
            </TabsContent>
            <TabsContent value="seasonal">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center p-3 bg-orange-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center mb-2">
                    <IceCream className="h-6 w-6 text-orange-500" />
                  </div>
                  <p className="font-medium text-center">Pumpkin Spice</p>
                  <p className="text-xs text-gray-500 text-center">Fall favorite</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-red-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mb-2">
                    <IceCream className="h-6 w-6 text-red-500" />
                  </div>
                  <p className="font-medium text-center">Cranberry</p>
                  <p className="text-xs text-gray-500 text-center">Holiday special</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-amber-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center mb-2">
                    <IceCream className="h-6 w-6 text-amber-500" />
                  </div>
                  <p className="font-medium text-center">Gingerbread</p>
                  <p className="text-xs text-gray-500 text-center">Winter classic</p>
                </div>
                <div className="flex flex-col items-center p-3 bg-green-50 rounded-lg">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center mb-2">
                    <IceCream className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="font-medium text-center">Pistachio</p>
                  <p className="text-xs text-gray-500 text-center">Year-round favorite</p>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="community">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Chocolate Fudge Brownie</p>
                      <p className="text-xs text-gray-500">Logged by 128 explorers this month</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Top Pick</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Cookies and Cream</p>
                      <p className="text-xs text-gray-500">Logged by 112 explorers this month</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Popular</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                      <Users className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">Strawberry Cheesecake</p>
                      <p className="text-xs text-gray-500">Logged by 98 explorers this month</p>
                    </div>
                  </div>
                  <Badge className="bg-purple-500">Trending</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function for conditional class names
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
