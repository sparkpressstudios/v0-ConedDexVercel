import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronLeft, Download, Search, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createServerClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Badge Users | Admin",
  description: "View users who have earned this badge",
}

interface BadgeUsersPageProps {
  params: {
    id: string
  }
}

export default async function BadgeUsersPage({ params }: BadgeUsersPageProps) {
  const supabase = createServerClient()

  // Get badge details
  const { data: badge, error: badgeError } = await supabase.from("badges").select("*").eq("id", params.id).single()

  if (badgeError || !badge) {
    console.error("Error fetching badge:", badgeError)
    notFound()
  }

  // Get users who have this badge
  const { data: userBadges, error: usersError } = await supabase
    .from("user_badges")
    .select(`
      id,
      awarded_at,
      profiles (
        id,
        username,
        full_name,
        avatar_url
      )
    `)
    .eq("badge_id", params.id)
    .order("awarded_at", { ascending: false })

  if (usersError) {
    console.error("Error fetching users with badge:", usersError)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/dashboard/admin/badges/${params.id}`}>
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Users with {badge.name}</h1>
          <p className="text-muted-foreground">View and manage users who have earned this badge</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export List
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Recipients</CardTitle>
          <CardDescription>Users who have earned the {badge.name} badge</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search users..." className="pl-8" />
            </div>
          </div>

          {userBadges && userBadges.length > 0 ? (
            <div className="border rounded-md">
              <div className="grid grid-cols-12 gap-4 p-4 border-b bg-muted/50 text-sm font-medium">
                <div className="col-span-5">User</div>
                <div className="col-span-3">Username</div>
                <div className="col-span-3">Awarded On</div>
                <div className="col-span-1">Actions</div>
              </div>

              <div className="divide-y">
                {userBadges.map((userBadge) => (
                  <div key={userBadge.id} className="grid grid-cols-12 gap-4 p-4 items-center">
                    <div className="col-span-5 flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={userBadge.profiles?.avatar_url || ""} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{userBadge.profiles?.full_name || "Unknown User"}</p>
                        <p className="text-sm text-muted-foreground">ID: {userBadge.profiles?.id.substring(0, 8)}</p>
                      </div>
                    </div>
                    <div className="col-span-3">{userBadge.profiles?.username || "N/A"}</div>
                    <div className="col-span-3 text-sm">{formatDate(userBadge.awarded_at)}</div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/dashboard/admin/users/${userBadge.profiles?.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <User className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No users have earned this badge yet</h3>
              <p className="mt-2 text-muted-foreground">When users earn this badge, they will appear here.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
