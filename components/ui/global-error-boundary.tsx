"use client"

import type { ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { Shell } from "@/components/shell"
import { IceCream } from "lucide-react"
import Link from "next/link"

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class GlobalErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by GlobalErrorBoundary:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Shell layout="centered">
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="rounded-full bg-red-100 p-3 text-red-600 mb-4">
              <IceCream className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              We encountered an unexpected error. Please try refreshing the page.
            </p>
            <div className="space-y-3 w-full max-w-xs">
              <Button
                variant="default"
                className="w-full"
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
              >
                Refresh Page
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href="/">Return to Home</Link>
              </Button>
            </div>
          </div>
        </Shell>
      )
    }

    return this.props.children
  }
}

// Import React
import React from "react"
