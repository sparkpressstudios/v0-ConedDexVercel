import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import QuickActionsWithModal from "@/components/dashboard/quick-actions-with-modal"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = createServerClient()

  let user = null
  let profile = null

  try {
    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser

    if (user) {
      // Get the user's profile
      const { data: userProfile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

      profile = userProfile
    }
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
      </div>

      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <QuickActionsWithModal />
        </Suspense>
      </ErrorBoundary>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Welcome{profile ? `, ${profile.username || profile.full_name}` : ""}!</CardTitle>
            <CardDescription>Track your ice cream adventures with ConeDex</CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Use the quick actions above to get started, or explore the dashboard to see your stats, find new shops,
              and manage your flavor collection.
            </p>
          </CardContent>
        </Card>

        {/* Other dashboard cards can be added here */}
      </div>
    </div>
  )
}
