import type React from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { OfflineIndicator } from "@/components/ui/offline-indicator"
import { InstallPrompt } from "@/components/ui/install-prompt"

export function PagesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <OfflineIndicator />
      <InstallPrompt />
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  )
}
