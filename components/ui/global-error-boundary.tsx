"use client"

import { Component, type ErrorInfo, type ReactNode } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can log the error to an error reporting service
    console.error("Error caught by error boundary:", error, errorInfo)
    this.setState({ errorInfo })

    // You could also send this to your analytics or error tracking service
    // Example: sendToErrorTracking(error, errorInfo);
  }

  resetError = (): void => {
    this.setState({ hasError: false, error: null, errorInfo: null })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center min-h-[50vh] p-6 text-center">
            <div className="mb-6 text-red-500">
              <AlertTriangle size={48} />
            </div>
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="mb-6 text-gray-600 max-w-md">
              We've encountered an unexpected error. Please try refreshing the page or contact support if the problem
              persists.
            </p>
            <div className="space-x-4">
              <Button onClick={this.resetError} variant="outline">
                Try Again
              </Button>
              <Button onClick={() => window.location.reload()}>Refresh Page</Button>
            </div>
            {process.env.NODE_ENV !== "production" && this.state.error && (
              <div className="mt-8 p-4 bg-gray-100 rounded-md text-left overflow-auto max-w-full">
                <p className="font-mono text-sm text-red-600 mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-semibold">Stack Trace</summary>
                    <pre className="mt-2 text-xs overflow-auto p-2 bg-gray-200 rounded">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )
      )
    }

    return this.props.children
  }
}
