"use client"

import type React from "react"

import { Component, type ReactNode, useState, useEffect } from "react"
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
  errorInfo: React.ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log the error to console
    console.error("Error caught by GlobalErrorBoundary:", error, errorInfo)

    this.setState({
      error,
      errorInfo,
    })

    // You could also log to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return (
        <ErrorDisplay
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          reset={() => {
            this.setState({ hasError: false, error: null, errorInfo: null })
          }}
        />
      )
    }

    return this.props.children
  }
}

// Separate component for error display
function ErrorDisplay({
  error,
  errorInfo,
  reset,
}: {
  error: Error | null
  errorInfo: React.ErrorInfo | null
  reset: () => void
}) {
  const [showDetails, setShowDetails] = useState(false)

  // Report error details to console for debugging
  useEffect(() => {
    console.error("Rendered error display:", { error, errorInfo })
  }, [error, errorInfo])

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

        {showDetails && (
          <div className="mb-6 w-full max-w-md">
            <div className="bg-gray-100 p-4 rounded-md text-left overflow-auto max-h-[200px] mb-4">
              <p className="font-mono text-sm text-red-600">{error?.toString()}</p>
              {errorInfo && (
                <pre className="mt-2 font-mono text-xs text-gray-700 whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </div>
        )}

        <div className="space-y-3 w-full max-w-xs">
          <Button
            variant="default"
            className="w-full"
            onClick={() => {
              reset()
              window.location.reload()
            }}
          >
            Refresh Page
          </Button>
          <Button variant="outline" className="w-full" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? "Hide Error Details" : "Show Error Details"}
          </Button>
          <Button asChild variant="outline" className="w-full">
            <Link href="/">Return to Home</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link href="/diagnostic">Run Diagnostics</Link>
          </Button>
        </div>
      </div>
    </Shell>
  )
}
