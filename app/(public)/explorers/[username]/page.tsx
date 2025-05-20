import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { PersonalFlavorCollection } from "@/components/flavor/personal-flavor-collection"
import { VisitedShops } from "@/components/shop/visited-shops"
import { UserAchievements } from "@/components/user/user-achievements"
import { QuestAchievements } from "@/components/user/quest-achievements"
import { PersonalStats } from "@/components/user/personal-stats"
import { CalendarDays, MapPin, Star } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function ExplorerProfilePage({ params }: { params: { username: string } }) {
  const { username } = params
  const supabase = await createServerClient()

  // Get user by username
  const { data: profile, error } = await supabase.from("profiles").select("*").eq("username", username).single()

  if (error || !profile) {
    notFound()
  }

  // Get current user to check if viewing own profile
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isOwnProfile = user?.id === profile.id

  // Get join date
  const { data: authUser } = await supabase.from("auth.users").select("created_at").eq("id", profile.id).single()
  const joinDate = authUser?.created_at ? new Date(authUser.created_at) : new Date()

  return (
    <div className="container py-10">
      <div className="space-y-8">
        {/* Profile Header */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <Avatar className="h-24 w-24 border-4 border-background">
            <AvatarImage src={profile.avatar_url || "/placeholder.svg"} alt={profile.username} />
            <AvatarFallback className="text-2xl">{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{profile.display_name || profile.username}</h1>
                <div className="flex items-center gap-2 text-muted-foreground mt-1">
                  <span>@{profile.username}</span>
                  {profile.location && (
                    <>
                      <span>•</span>
                      <span className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1" />
                        {profile.location}
                      </span>
                    </>
                  )}
                </div>
              </div>

              {isOwnProfile ? (
                <Button asChild>
                  <Link href="/dashboard/profile">Edit Profile</Link>
                </Button>
              ) : (
                <Button variant="outline">Follow</Button>
              )}
            </div>

            <div className="mt-4">
              <p className="text-muted-foreground">{profile.bio || "No bio provided"}</p>
            </div>

            <div className="flex flex-wrap gap-3 mt-4">
              <Badge variant="outline" className="flex items-center gap-1">
                <CalendarDays className="h-3 w-3" />
                <span>Joined {joinDate.toLocaleDateString()}</span>
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Star className="h-3 w-3" />
                <span>Explorer</span>
              </Badge>
              {profile.role === "admin" && <Badge className="bg-red-100 text-red-800 hover:bg-red-200">Admin</Badge>}
              {profile.role === "moderator" && (
                <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">Moderator</Badge>
              )}
            </div>
          </div>
        </div>

        {/* Profile Content */}
        <Tabs defaultValue="flavors">
          <TabsList className="mb-6">
            <TabsTrigger value="flavors">Flavors</TabsTrigger>
            <TabsTrigger value="shops">Shops</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="quests">Quests</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
          </TabsList>

          <TabsContent value="flavors">
            <PersonalFlavorCollection userId={profile.id} />
          </TabsContent>

          <TabsContent value="shops">
            <VisitedShops userId={profile.id} />
          </TabsContent>

          <TabsContent value="achievements">
            <UserAchievements userId={profile.id} />
          </TabsContent>

          <TabsContent value="quests">
            <QuestAchievements userId={profile.id} />
          </TabsContent>

          <TabsContent value="stats">
            <PersonalStats userId={profile.id} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
