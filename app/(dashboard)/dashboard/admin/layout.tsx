import type React from "react"
import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"
import { AdminHeader } from "@/components/layout/admin-header"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Check if user is admin
  const userRole = await getUserRole()

  if (userRole !== "admin") {
    return redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <div className="hidden md:block w-64 border-r">
          <AdminSidebar />
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}
