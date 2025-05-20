import { Suspense } from "react"
import type { Metadata } from "next"
import { createServerClient } from "@/lib/supabase/server"
import { Skeleton } from "@/components/ui/skeleton"
import { NotificationsList } from "@/components/notifications/notifications-list"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "Notifications | ConeDex",
  description: "View and manage your notifications",
}

export default async function NotificationsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please sign in to view your notifications</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Notifications</h2>
        <p className="text-muted-foreground">Stay updated with your activity and achievements</p>
      </div>

      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <NotificationsList />
      </Suspense>
    </div>
  )
}
