import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeForm } from "@/components/admin/badges/badge-form"
import { createServerClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Edit Badge | Admin",
  description: "Edit an existing achievement badge",
}

interface EditBadgePageProps {
  params: {
    id: string
  }
}

export default async function EditBadgePage({ params }: EditBadgePageProps) {
  const supabase = createServerClient()

  const { data: badge, error } = await supabase.from("badges").select("*").eq("id", params.id).single()

  if (error || !badge) {
    console.error("Error fetching badge:", error)
    notFound()
  }

  // Transform the data to match the form schema
  const formData = {
    id: badge.id,
    name: badge.name,
    description: badge.description,
    requirements: badge.requirements,
    imageUrl: badge.image_url || "",
    availableFrom: badge.available_from ? new Date(badge.available_from) : undefined,
    availableUntil: badge.available_until ? new Date(badge.available_until) : undefined,
    points: badge.points || 0,
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
        <div>
          <h1 className="text-2xl font-bold">Edit Badge</h1>
          <p className="text-muted-foreground">Update the details for {badge.name}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Details</CardTitle>
          <CardDescription>
            Update the information for this badge. Badges are awarded to users for completing specific achievements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeForm initialData={formData} />
        </CardContent>
      </Card>
    </div>
  )
}
