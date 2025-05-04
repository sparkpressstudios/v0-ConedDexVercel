import type React from "react"
import { DashboardSidebar } from "@/components/layout/dashboard-sidebar"
import { DashboardHeader } from "@/components/layout/dashboard-header"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"

// This is a special layout for preview environments that doesn't require authentication
export default function DashboardPreviewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Create a mock user profile for preview purposes
  const mockProfile = {
    id: "preview-user-id",
    username: "preview-user",
    full_name: "Preview User",
    role: "admin",
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=PreviewUser`,
    bio: "This is a preview account for demonstration purposes.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    favorite_flavor: "Preview Flavor",
  }

  return (
    <div className="flex min-h-screen flex-col">
      <OfflineIndicator />
      <InstallPrompt />
      <div className="flex flex-1">
        <DashboardSidebar user={mockProfile} />
        <div className="flex flex-1 flex-col">
          <DashboardHeader user={mockProfile} />
          <main className="flex-1 p-4 md:p-6">
            <div className="mb-4 rounded-md bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">Preview Mode</p>
              <p className="text-sm">
                You are viewing this page in preview mode. Authentication is bypassed for demonstration purposes.
              </p>
            </div>
            {children}
          </main>
        </div>
      </div>
    </div>
  )
}
