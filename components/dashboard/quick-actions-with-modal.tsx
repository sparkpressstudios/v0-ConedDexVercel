"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Star, Store } from "lucide-react"
import Link from "next/link"
import LogFlavorButton from "@/components/flavor/log-flavor-button"

export default function QuickActionsWithModal() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks you can perform</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <LogFlavorButton className="w-full" />

        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/shops/map">
            <MapPin className="mr-2 h-4 w-4" />
            Find Shops
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/shops">
            <Store className="mr-2 h-4 w-4" />
            Browse Shops
          </Link>
        </Button>

        <Button variant="outline" className="w-full" asChild>
          <Link href="/dashboard/flavors">
            <Star className="mr-2 h-4 w-4" />
            My Flavors
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
