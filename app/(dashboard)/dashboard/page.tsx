import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, MapPin, Search, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getDemoUser } from "@/lib/auth/session"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  // Create a try/catch block to handle potential errors
  try {
    const supabase = createServerClient()
    const cookieStore = cookies()
    const demoUserEmail = cookieStore.get("conedex_demo_user")?.value
    const isDemoUser = !!demoUserEmail

    let user = null
    let profile = null
    let uniqueFlavors = 0
    let uniqueShops = 0
    let badgesCount = 0

    if (isDemoUser) {
      // Use demo data for demo users
      const demoUser = getDemoUser()
      user = demoUser
      profile = {
        id: demoUser?.id,
        username: demoUserEmail?.split("@")[0] || "demo",
        full_name: demoUser?.name || "Demo User",
        avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${demoUser?.name || "Demo"}`,
        role: demoUser?.role || "explorer",
      }

      // Demo stats
      uniqueFlavors = 20
      uniqueShops = 8
      badgesCount = 5
    } else {
      // Get the current user
      const {
        data: { user: currentUser },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        throw new Error(`Error fetching user: ${userError.message}`)
      }

      user = currentUser

      if (user) {
        // Get the user's profile
        const { data: userProfile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single()

        if (profileError && profileError.code !== "PGRST116") {
          console.error("Error fetching profile:", profileError)
        }

        profile = userProfile || {
          id: user.id,
          username: user.email?.split("@")[0] || "User",
          full_name: user.email?.split("@")[0] || "User",
          avatar_url: null,
          role: "explorer",
        }

        // Get unique flavors count
        const { data: flavorLogsData, error: flavorError } = await supabase
          .from("flavor_logs")
          .select("flavor_id")
          .eq("user_id", user.id)

        if (flavorError) {
          console.error("Error fetching flavor logs:", flavorError)
        } else if (flavorLogsData) {
          uniqueFlavors = new Set(flavorLogsData.map((log) => log.flavor_id)).size
        }

        // Get unique shops count
        const { data: shopLogsData, error: shopError } = await supabase
          .from("flavor_logs")
          .select("shop_id")
          .eq("user_id", user.id)

        if (shopError) {
          console.error("Error fetching shop logs:", shopError)
        } else if (shopLogsData) {
          uniqueShops = new Set(shopLogsData.map((log) => log.shop_id).filter(Boolean)).size
        }

        // Get badges count
        const { count: userBadgesCount, error: badgeError } = await supabase
          .from("user_badges")
          .select("*", { count: "exact", head: true })
          .eq("user_id", user.id)

        if (badgeError) {
          console.error("Error fetching badges:", badgeError)
        } else {
          badgesCount = userBadgesCount || 0
        }
      }
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
                <p className="mt-1 text-white/80">Welcome to ConeDex</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
                <Link href="/dashboard/flavors">
                  <IceCream className="mr-2 h-4 w-4" />
                  Browse Flavors
                </Link>
              </Button>
              <Button asChild variant="outline" className="bg-white/10 text-white hover:bg-white/20">
                <Link href="/dashboard/shops">
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

        {/* Ice Cream Stats */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Your Ice Cream Journey</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border border-gray-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex flex-col items-center text-center">
                  <div className="mb-3 p-3 bg-orange-100 rounded-lg">
                    <IceCream className="h-6 w-6 text-orange-500" />
                  </div>
                  <h3 className="text-sm font-medium text-gray-600">Flavors Logged</h3>
                  <p className="text-2xl font-bold mt-1 text-gray-900">{uniqueFlavors}</p>
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
                  <p className="text-2xl font-bold mt-1 text-gray-900">{uniqueShops}</p>
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
                  <p className="text-2xl font-bold mt-1 text-gray-900">{badgesCount}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Explorer Tools */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Explorer Tools</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <Link href="/dashboard/flavors">
              <Card className="border border-gray-100 shadow-sm bg-coral-50 hover:bg-coral-100 transition-colors cursor-pointer h-full">
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
            </Link>

            <Link href="/dashboard/shops">
              <Card className="border border-gray-100 shadow-sm bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-orange-500 rounded-lg text-white mb-3">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-800">Shop Directory</span>
                    <p className="text-xs text-gray-500 mt-1">Find ice cream shops</p>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/badges">
              <Card className="border border-gray-100 shadow-sm bg-teal-50 hover:bg-teal-100 transition-colors cursor-pointer h-full">
                <CardContent className="p-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="p-2 bg-teal-500 rounded-lg text-white mb-3">
                      <Award className="h-5 w-5" />
                    </div>
                    <span className="font-medium text-gray-800">Badges</span>
                    <p className="text-xs text-gray-500 mt-1">View your achievements</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Getting Started Guide */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with ConeDex</CardTitle>
            <CardDescription>Follow these steps to begin your ice cream adventure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  1
                </div>
                <div>
                  <h3 className="font-medium">Browse Flavors</h3>
                  <p className="text-sm text-muted-foreground">
                    Explore our database of ice cream flavors and discover new favorites.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  2
                </div>
                <div>
                  <h3 className="font-medium">Find Shops</h3>
                  <p className="text-sm text-muted-foreground">
                    Locate ice cream shops near you or in areas you plan to visit.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  3
                </div>
                <div>
                  <h3 className="font-medium">Log Your Discoveries</h3>
                  <p className="text-sm text-muted-foreground">
                    Keep track of flavors you've tried and shops you've visited.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600">
                  4
                </div>
                <div>
                  <h3 className="font-medium">Earn Badges</h3>
                  <p className="text-sm text-muted-foreground">
                    Complete achievements to earn badges and track your progress.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/flavors">Start Exploring</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <div className="space-y-6">
        <Card className="border-red-100">
          <CardHeader>
            <CardTitle className="text-red-600">Dashboard Error</CardTitle>
            <CardDescription>
              We encountered an issue loading your dashboard. This might be due to missing environment variables or a
              connection issue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Please make sure the following environment variables are set:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
              <li>NEXT_PUBLIC_SUPABASE_URL</li>
              <li>NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/">Return to Home</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
}
