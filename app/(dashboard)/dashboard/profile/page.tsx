import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserRanking } from "@/components/leaderboard/user-ranking"

export default async function ProfilePage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user?.id).single()

  // Get flavor logs count
  const { count: flavorLogsCount } = await supabase
    .from("flavor_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user?.id)

  // Get badges
  const { data: badges } = await supabase
    .from("user_badges")
    .select(`
      *,
      badges:badge_id (name, description, image_url, rarity)
    `)
    .eq("user_id", user?.id)
    .order("awarded_at", { ascending: false })

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">My Profile</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={profile?.avatar_url || "/placeholder.svg"}
                alt={profile?.full_name || profile?.username}
              />
              <AvatarFallback>{getInitials(profile?.full_name || profile?.username || "User")}</AvatarFallback>
            </Avatar>
            <h2 className="mt-4 text-xl font-bold">{profile?.full_name || "No Name Set"}</h2>
            <p className="text-sm text-muted-foreground">@{profile?.username || "username"}</p>
            <div className="mt-2 flex items-center gap-1">
              <span className="rounded-full bg-pink-100 px-2 py-1 text-xs font-medium text-pink-800">
                {profile?.role === "explorer"
                  ? "Ice Cream Explorer"
                  : profile?.role === "shop_owner"
                    ? "Shop Owner"
                    : "User"}
              </span>
            </div>
            <p className="mt-4 text-sm">{profile?.bio || "No bio yet"}</p>
            <Button asChild className="mt-4 w-full">
              <Link href="/dashboard/settings">Edit Profile</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Stats</CardTitle>
            <CardDescription>Your ice cream journey so far</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm font-medium">Flavors Logged</p>
                <p className="text-3xl font-bold">{flavorLogsCount || 0}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm font-medium">Badges Earned</p>
                <p className="text-3xl font-bold">{badges?.length || 0}</p>
              </div>
              <div className="rounded-lg bg-muted p-4 text-center">
                <p className="text-sm font-medium">Member Since</p>
                <p className="text-lg font-bold">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="mb-4 text-lg font-medium">Badges</h3>
              {badges && badges.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex flex-col items-center text-center">
                      <div className="h-16 w-16 rounded-full bg-pink-100 p-3">
                        <img
                          src={badge.badges?.image_url || "/placeholder.svg?height=100&width=100&query=badge icon"}
                          alt={badge.badges?.name || "Badge"}
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <p className="mt-2 text-sm font-medium">{badge.badges?.name || "Badge"}</p>
                      <p className="text-xs text-muted-foreground">
                        {badge.badges?.rarity || "Common"} • {new Date(badge.awarded_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground">No badges earned yet</p>
                    <Button asChild variant="link" className="mt-2">
                      <Link href="/dashboard/badges">View available badges</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        <UserRanking userId={user?.id} />
      </div>
    </div>
  )
}
