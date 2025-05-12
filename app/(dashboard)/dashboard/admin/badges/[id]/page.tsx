import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { Award, ChevronLeft, Edit, Users } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase/server"
import { formatDate } from "@/lib/utils"

export const metadata: Metadata = {
  title: "Badge Details | Admin",
  description: "View and manage badge details",
}

interface BadgeDetailsPageProps {
  params: {
    id: string
  }
}

export default async function BadgeDetailsPage({ params }: BadgeDetailsPageProps) {
  const supabase = createServerClient()

  const { data: badge, error } = await supabase.from("badges").select("*").eq("id", params.id).single()

  if (error || !badge) {
    console.error("Error fetching badge:", error)
    notFound()
  }

  // Get count of users who have this badge
  const { count: userCount, error: countError } = await supabase
    .from("user_badges")
    .select("*", { count: "exact", head: true })
    .eq("badge_id", params.id)

  if (countError) {
    console.error("Error fetching user count:", countError)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/badges">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{badge.name}</h1>
          <p className="text-muted-foreground">Badge details and statistics</p>
        </div>
        <Button asChild>
          <Link href={`/dashboard/admin/badges/${params.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Edit Badge
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Badge Information</CardTitle>
            <CardDescription>Details about this achievement badge</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              {badge.image_url ? (
                <img
                  src={badge.image_url || "/placeholder.svg"}
                  alt={badge.name}
                  className="h-40 w-40 object-contain"
                  onError={(e) => {
                    e.currentTarget.src = "/fruit-ice-cream-badge.png"
                  }}
                />
              ) : (
                <div className="h-40 w-40 rounded-full bg-primary/10 flex items-center justify-center">
                  <Award className="h-20 w-20 text-primary" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="mt-1">{badge.description}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Requirements</h3>
                <p className="mt-1">{badge.requirements}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Points Value</h3>
                  <p className="mt-1">{badge.points || 0} points</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                  <p className="mt-1">{formatDate(badge.created_at)}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Available From</h3>
                  <p className="mt-1">{badge.available_from ? formatDate(badge.available_from) : "Always"}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Available Until</h3>
                  <p className="mt-1">{badge.available_until ? formatDate(badge.available_until) : "No expiration"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Badge Statistics</CardTitle>
            <CardDescription>Usage and distribution data</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center h-40">
              <div className="text-center">
                <div className="flex items-center justify-center">
                  <Users className="h-12 w-12 text-primary" />
                </div>
                <h3 className="mt-2 text-3xl font-bold">{userCount || 0}</h3>
                <p className="text-muted-foreground">Users have earned this badge</p>
              </div>
            </div>

            <div className="space-y-4">
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/dashboard/admin/badges/${params.id}/users`}>
                  <Users className="mr-2 h-4 w-4" />
                  View Users with this Badge
                </Link>
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                  <p className="mt-1">
                    {!badge.available_from || new Date(badge.available_from) <= new Date()
                      ? badge.available_until && new Date(badge.available_until) < new Date()
                        ? "Expired"
                        : "Active"
                      : "Scheduled"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Awarded</h3>
                  <p className="mt-1">Not available</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
