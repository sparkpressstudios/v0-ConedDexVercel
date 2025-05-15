import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { notFound } from "next/navigation"

interface PublicProfilePageProps {
  params: {
    username: string
  }
}

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
  const { username } = params
  const supabase = createServerClient()

  // Get user profile by username
  const { data: profile } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (!profile) {
    notFound()
  }

  // Get flavor logs count
  const { count: flavorLogsCount } = await supabase
    .from("flavor_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", profile.id)

  // Get badges
  const { data: badges } = await supabase
    .from("user_badges")
    .select(`
      *,
      badges:badge_id (name, description, image_url, rarity)
    `)
    .eq("user_id", profile.id)
    .order("awarded_at", { ascending: false })

  // Get recent flavor logs
  const { data: recentFlavorLogs } = await supabase
    .from("flavor_logs")
    .select(`
      *,
      flavors:flavor_id (name, description, image_url),
      shops:shop_id (name, location)
    `)
    .eq("user_id", profile.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <div className="container mx-auto max-w-6xl space-y-6 py-8">
      <h1 className="text-3xl font-bold">{profile.full_name || profile.username}'s Profile</h1>

      {/* Profile Backdrop */}
      <div className="relative h-64 w-full overflow-hidden rounded-lg">
        {profile?.backdrop_url ? (
          <img
            src={profile.backdrop_url || "/placeholder.svg"}
            alt="Profile backdrop"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-r from-pink-100 to-pink-200">
            <p className="text-lg font-medium text-pink-800">Ice Cream Explorer</p>
          </div>
        )}

        {/* Avatar positioned over the backdrop */}
        <div className="absolute -bottom-12 left-6">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage
              src={profile?.avatar_url || "/placeholder.svg"}
              alt={profile?.full_name || profile?.username}
            />
            <AvatarFallback>{getInitials(profile?.full_name || profile?.username || "User")}</AvatarFallback>
          </Avatar>
        </div>
      </div>

      <div className="grid gap-6 pt-12 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Explorer Profile</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center text-center">
            <h2 className="mt-4 text-xl font-bold">{profile?.full_name || profile.username}</h2>
            <p className="text-sm text-muted-foreground">@{profile?.username}</p>
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
            {profile?.location && <p className="mt-2 text-sm text-muted-foreground">📍 {profile.location}</p>}
            {profile?.website && (
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 text-sm text-primary hover:underline"
              >
                🌐 {profile.website.replace(/^https?:\/\//, "")}
              </a>
            )}
            <div className="mt-6 grid w-full grid-cols-3 gap-2 rounded-lg bg-muted p-4">
              <div className="text-center">
                <p className="text-sm font-medium">Flavors</p>
                <p className="text-xl font-bold">{flavorLogsCount || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Badges</p>
                <p className="text-xl font-bold">{badges?.length || 0}</p>
              </div>
              <div className="text-center">
                <p className="text-sm font-medium">Since</p>
                <p className="text-sm font-medium">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Ice Cream Adventures</CardTitle>
            <CardDescription>Latest flavors {profile.full_name || profile.username} has tried</CardDescription>
          </CardHeader>
          <CardContent>
            {recentFlavorLogs && recentFlavorLogs.length > 0 ? (
              <div className="space-y-4">
                {recentFlavorLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-4 rounded-lg border p-4">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                      <img
                        src={log.flavors?.image_url || "/placeholder.svg?height=100&width=100&query=ice cream"}
                        alt={log.flavors?.name || "Flavor"}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium">{log.flavors?.name || "Unknown Flavor"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {log.shops?.name || "Unknown Shop"} • {new Date(log.created_at).toLocaleDateString()}
                      </p>
                      {log.rating && (
                        <div className="mt-1 flex items-center">
                          <div className="flex">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <span key={i} className={i < log.rating ? "text-yellow-500" : "text-gray-300"}>
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {log.notes && <p className="mt-2 text-sm">{log.notes}</p>}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex h-32 items-center justify-center rounded-lg border border-dashed">
                <p className="text-sm text-muted-foreground">No flavors logged yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Badges Collection</CardTitle>
            <CardDescription>Achievements earned on the ice cream journey</CardDescription>
          </CardHeader>
          <CardContent>
            {badges && badges.length > 0 ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6">
                {badges.map((badge) => (
                  <div key={badge.id} className="flex flex-col items-center text-center">
                    <div className="h-20 w-20 rounded-full bg-pink-100 p-4">
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
                <p className="text-sm text-muted-foreground">No badges earned yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
