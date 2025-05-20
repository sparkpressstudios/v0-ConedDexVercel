import type React from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { Shell } from "@/components/shell"
import { ClientErrorBoundary } from "@/components/ui/client-error-boundary"
import FallbackPage from "./fallback-page"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <Shell layout="default">
        <ClientErrorBoundary fallback={<FallbackPage />}>{children}</ClientErrorBoundary>
      </Shell>
      <PublicFooter />
    </>
  )
}
