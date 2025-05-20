import type React from "react"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"
import { Shell } from "@/components/shell"

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PublicHeader />
      <Shell layout="default">{children}</Shell>
      <PublicFooter />
    </>
  )
}
