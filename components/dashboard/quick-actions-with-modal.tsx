"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { IceCream, MapPin, Award, Star } from "lucide-react"
import Link from "next/link"
import { LogFlavorButton } from "@/components/flavor/log-flavor-button"
import { cn } from "@/lib/utils"

export default function QuickActionsWithModal() {
  const { user } = useAuth()
  const userRole = user?.role || "explorer"
  const isExplorer = userRole === "explorer"

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className={cn(isExplorer && "border-strawberry-100 hover:border-strawberry-200 transition-colors")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("text-sm font-medium", isExplorer && "text-strawberry-700")}>
            Log New Flavor
          </CardTitle>
          <IceCream className={cn("h-4 w-4 text-muted-foreground", isExplorer && "text-strawberry-500")} />
        </CardHeader>
        <CardContent className="pt-4">
          <LogFlavorButton className="w-full" />
        </CardContent>
      </Card>

      <Card className={cn(isExplorer && "border-mint-100 hover:border-mint-200 transition-colors")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("text-sm font-medium", isExplorer && "text-mint-700")}>Find Shops</CardTitle>
          <MapPin className={cn("h-4 w-4 text-muted-foreground", isExplorer && "text-mint-500")} />
        </CardHeader>
        <CardContent className="pt-4">
          <Button asChild variant="default" className={cn("w-full", isExplorer && "bg-mint-500 hover:bg-mint-600")}>
            <Link href="/dashboard/shops">Discover Shops</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className={cn(isExplorer && "border-blueberry-100 hover:border-blueberry-200 transition-colors")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("text-sm font-medium", isExplorer && "text-blueberry-700")}>
            View Leaderboard
          </CardTitle>
          <Award className={cn("h-4 w-4 text-muted-foreground", isExplorer && "text-blueberry-500")} />
        </CardHeader>
        <CardContent className="pt-4">
          <Button
            asChild
            variant="default"
            className={cn("w-full", isExplorer && "bg-blueberry-500 hover:bg-blueberry-600")}
          >
            <Link href="/dashboard/leaderboard">See Rankings</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className={cn(isExplorer && "border-vanilla-100 hover:border-vanilla-200 transition-colors")}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className={cn("text-sm font-medium", isExplorer && "text-vanilla-800")}>Your Profile</CardTitle>
          <Star className={cn("h-4 w-4 text-muted-foreground", isExplorer && "text-vanilla-600")} />
        </CardHeader>
        <CardContent className="pt-4">
          <Button
            asChild
            variant="default"
            className={cn("w-full", isExplorer && "bg-vanilla-500 hover:bg-vanilla-600")}
          >
            <Link href="/dashboard/profile">View Profile</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
