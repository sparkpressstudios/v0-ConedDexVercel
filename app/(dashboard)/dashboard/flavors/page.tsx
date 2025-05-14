import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Skeleton } from "@/components/ui/skeleton"
import { ErrorBoundary } from "@/components/ui/error-boundary"
import LogFlavorButton from "@/components/flavor/log-flavor-button"

export default async function FlavorsPage() {
  const supabase = createServerClient()

  let user = null

  try {
    // Get the current user
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()
    user = currentUser
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Flavors</h1>
        <LogFlavorButton />
      </div>

      <p className="text-muted-foreground">View and manage all the ice cream flavors you've tried.</p>

      <ErrorBoundary>
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          {/* Flavor list component would go here */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{/* Flavor cards would go here */}</div>
        </Suspense>
      </ErrorBoundary>
    </div>
  )
}
