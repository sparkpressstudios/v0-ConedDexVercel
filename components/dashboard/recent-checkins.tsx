"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, User } from "lucide-react"
import { getRecentCheckIns } from "@/app/actions/shop-checkin-actions"
import Link from "next/link"
import { formatDistanceToNow } from "date-fns"

interface CheckIn {
  id: string
  created_at: string
  shop: {
    id: string
    name: string
    city: string
    state: string
  }
  user: {
    id: string
    username: string
    full_name: string
    avatar_url: string | null
  }
}

export default function RecentCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchCheckIns = async () => {
      setIsLoading(true)
      try {
        const result = await getRecentCheckIns(5)
        if (result.success && result.data) {
          setCheckIns(result.data as CheckIn[])
        }
      } catch (error) {
        console.error("Error fetching check-ins:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCheckIns()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Check-ins</CardTitle>
        <CardDescription>See where the ConeDex community is exploring</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
          </div>
        ) : checkIns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No check-ins yet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Be the first to check in to an ice cream shop!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {checkIns.map((checkIn) => (
              <div key={checkIn.id} className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={checkIn.user.avatar_url || undefined} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex flex-wrap items-center gap-1">
                    <Link href={`/explorers/${checkIn.user.username}`} className="font-medium hover:underline">
                      {checkIn.user.full_name || checkIn.user.username}
                    </Link>
                    <span className="text-sm text-muted-foreground">checked in at</span>
                    <Link href={`/business/${checkIn.shop.id}`} className="font-medium hover:underline">
                      {checkIn.shop.name}
                    </Link>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>
                      {checkIn.shop.city}, {checkIn.shop.state}
                    </span>
                    <span>•</span>
                    <time dateTime={checkIn.created_at}>
                      {formatDistanceToNow(new Date(checkIn.created_at), { addSuffix: true })}
                    </time>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
