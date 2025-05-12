import type { Metadata } from "next"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BadgeForm } from "@/components/admin/badges/badge-form"

export const metadata: Metadata = {
  title: "Create Badge | Admin",
  description: "Create a new achievement badge for users",
}

export default function CreateBadgePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/admin/badges">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Create New Badge</h1>
          <p className="text-muted-foreground">Add a new achievement badge to the platform</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Badge Details</CardTitle>
          <CardDescription>
            Enter the information for the new badge. Badges are awarded to users for completing specific achievements.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BadgeForm />
        </CardContent>
      </Card>
    </div>
  )
}
