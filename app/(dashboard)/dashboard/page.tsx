"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

export default function DashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.push("/login")
        return
      }

      // Redirect based on role
      if (user.role === "admin") {
        router.push("/dashboard/admin")
      } else if (user.role === "shop_owner") {
        router.push("/dashboard/shop")
      } else {
        // Default explorer dashboard
        router.push("/dashboard/explorer")
      }
    }
  }, [user, isLoading, router])

  // Show loading state while checking auth
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return null // Will redirect based on role
}
