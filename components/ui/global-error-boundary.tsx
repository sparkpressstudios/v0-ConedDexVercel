"use client"

import type React from "react"

interface GlobalErrorBoundaryProps {
  children: React.ReactNode
}

export function GlobalErrorBoundary({ children }: GlobalErrorBoundaryProps) {
  return <>{children}</>
}
