"use client"

import type React from "react"
import { useAuth } from "@/contexts/auth-context"

interface RoleGateProps {
  children: React.ReactNode
  allowedRoles: string[]
  fallback?: React.ReactNode
}

export function RoleGate({ children, allowedRoles, fallback }: RoleGateProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return null
  }

  if (!user || !user.role || !allowedRoles.includes(user.role)) {
    return fallback || null
  }

  return <>{children}</>
}
