import { createServerClient } from "@/lib/supabase/server"
import { DashboardClient } from "./dashboard-client"
import { DashboardFallback } from "@/components/dashboard/dashboard-fallback"
import { getCurrentRole, getUser, getUserProfile } from "@/lib/auth/session"

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function DashboardPage() {
  try {
    const supabase = createServerClient()
    const user = await getUser()

    if (!user) {
      return <DashboardFallback title="Authentication Required" error="Please sign in to view your dashboard." />
    }

    // Get user profile
    const profile = await getUserProfile()

    // Get user role
    const userRole = await getCurrentRole()

    // Get recent check-ins
    const { data: recentCheckIns, error: checkInsError } = await supabase
      .from("shop_checkins")
      .select("*, shops(name, city, state)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (checkInsError) {
      console.error("Error fetching check-ins:", checkInsError)
    }

    // Get recent flavor logs
    const { data: recentFlavors, error: flavorsError } = await supabase
      .from("flavor_logs")
      .select("*, shops(name)")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3)

    if (flavorsError) {
      console.error("Error fetching flavors:", flavorsError)
    }

    return (
      <DashboardClient
        profile={profile}
        userRole={userRole}
        recentCheckIns={recentCheckIns || []}
        recentFlavors={recentFlavors || []}
        userId={user.id}
      />
    )
  } catch (error) {
    console.error("Dashboard error:", error)
    return (
      <DashboardFallback
        title="Dashboard Error"
        error="We encountered an issue loading your dashboard. This might be due to a temporary service disruption."
      />
    )
  }
}
