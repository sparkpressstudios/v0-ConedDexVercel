"use client"

import React from "react"
import { AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Component, type ErrorInfo, type ReactNode } from "react"

interface ErrorBoundaryProps {
  fallback: ReactNode
  children: ReactNode
  onReset?: () => void
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true, error: _ }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error, errorInfo)
    // Log the error
    console.error("Component error:", error, errorInfo)

    // Call onError prop if provided
    this.props.onError?.(error, errorInfo)
  }

  resetErrorBoundary = (): void => {
    this.props.onReset?.()
    this.setState({ hasError: false, error: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              Something went wrong
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <pre className="mt-2 max-h-40 overflow-auto rounded bg-slate-950 p-4 text-xs text-white">
                {this.state.error.stack}
              </pre>
            )}
          </CardContent>
          <CardFooter>
            <Button size="sm" onClick={this.resetErrorBoundary} className="gap-1">
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </CardFooter>
        </Card>
      )
    }

    return this.props.children
  }
}

// Higher-order component to wrap components with ErrorBoundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, "children">,
): React.FC<P> {
  const displayName = Component.displayName || Component.name || "Component"

  const ComponentWithErrorBoundary = (props: P) => {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }

  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`

  return ComponentWithErrorBoundary
}

// Hook for functional components to use error boundaries
export function useErrorHandler(onError?: (error: Error) => void): (error: unknown) => void {
  return React.useCallback(
    (error: unknown) => {
      if (error instanceof Error) {
        onError?.(error)
        throw error
      }

      const normalizedError = new Error(error ? String(error) : "An unknown error occurred")
      onError?.(normalizedError)
      throw normalizedError
    },
    [onError],
  )
}
