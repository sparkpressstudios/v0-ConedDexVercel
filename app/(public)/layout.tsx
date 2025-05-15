export const dynamic = "force-dynamic"

import type React from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import ClientLayout from "../client-layout"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex-1">{children}</main>
        <PublicFooter />
      </div>
    </ClientLayout>
  )
}
