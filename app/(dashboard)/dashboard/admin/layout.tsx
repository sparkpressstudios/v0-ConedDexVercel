import type React from "react"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { AdminHeader } from "@/components/layout/admin-header"
import { ErrorBoundary } from "@/components/ui/error-boundary"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <AdminHeader />
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <ErrorBoundary
            fallback={
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Page</h2>
                <p className="text-red-700">
                  There was an error loading this admin page. Please try again later or contact support.
                </p>
              </div>
            }
          >
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
