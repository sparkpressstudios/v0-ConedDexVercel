import type React from "react"
import { redirect } from "next/navigation"
import { hasRole } from "@/lib/auth/session"

interface ServerRoleGateProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export async function ServerRoleGate({ children, allowedRoles, redirectTo = "/dashboard" }: ServerRoleGateProps) {
  const hasAccess = await hasRole(allowedRoles)

  if (!hasAccess) {
    return redirect(redirectTo)
  }

  return <>{children}</>
}
