"use client"

import Link from "next/link"
import { Award, Search, Filter, MoreHorizontal, Plus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createServerClient } from "@/lib/supabase/server"

export default async function BadgesManagementPage() {
  const supabase = createServerClient()
  const { data: badges, error } = await supabase.from("badges").select("*").order("name")

  if (error) {
    console.error("Error fetching badges:", error)
    // Return a fallback UI when there's an error
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Badge Management</h1>
            <p className="text-muted-foreground">Create and manage achievement badges for users</p>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/dashboard/admin/badges/create">
              <Plus className="mr-2 h-4 w-4" />
              Create New Badge
            </Link>
          </Button>
        </div>
        <div className="p-6 text-center">
          <div className="mb-4">
            <Award className="h-12 w-12 mx-auto text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium">Error Loading Badges</h3>
          <p className="text-muted-foreground mt-2">There was an error loading the badges. Please try again later.</p>
          <Button variant="outline" className="mt-4" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Badge Management</h1>
          <p className="text-muted-foreground">Create and manage achievement badges for users</p>
        </div>
        <Button asChild className="w-full sm:w-auto">
          <Link href="/dashboard/admin/badges/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Badge
          </Link>
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex w-full max-w-sm items-center space-x-2">
          <Input placeholder="Search badges..." className="w-full" type="search" />
          <Button type="submit" size="icon" variant="ghost">
            <Search className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges && badges.length > 0 ? (
          badges.map((badge) => (
            <BadgeCard
              key={badge.id}
              id={badge.id}
              name={badge.name}
              description={badge.description}
              imageUrl={badge.image_url}
              requirements={badge.requirements}
            />
          ))
        ) : (
          <div className="col-span-full flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
            <Award className="mb-2 h-8 w-8" />
            <p>No badges found. Create a new badge to get started.</p>
          </div>
        )}
      </div>
    </div>
  )
}

interface BadgeCardProps {
  id: string
  name: string
  description: string
  imageUrl: string | null
  requirements: string | null
}

function BadgeCard({ id, name, description, imageUrl, requirements }: BadgeCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative h-40 w-full bg-muted">
        <img src={imageUrl || "/fruit-ice-cream-badge.png"} alt={name} className="h-full w-full object-contain p-4" />
      </div>
      <CardHeader className="pb-2 flex-grow-0">
        <div className="flex items-start justify-between">
          <CardTitle className="line-clamp-1 text-base sm:text-lg">{name}</CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/badges/${id}`}>View Details</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/dashboard/admin/badges/${id}/edit`}>Edit Badge</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete Badge</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <CardDescription className="line-clamp-2 text-xs sm:text-sm">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="line-clamp-3">
            <span className="font-medium">Requirements:</span> {requirements || "Complete specific achievements"}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
