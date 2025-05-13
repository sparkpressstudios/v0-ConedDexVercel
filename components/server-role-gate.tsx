import type React from "react"
import { redirect } from "next/navigation"
import { getUserRole } from "@/lib/auth/session"

interface ServerRoleGateProps {
  children: React.ReactNode
  allowedRoles: string[]
  redirectTo?: string
}

export async function ServerRoleGate({ children, allowedRoles, redirectTo = "/dashboard" }: ServerRoleGateProps) {
  const userRole = await getUserRole()

  if (!userRole || !allowedRoles.includes(userRole)) {
    return redirect(redirectTo)
  }

  return <>{children}</>
}
