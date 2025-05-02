"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export interface ImportProgressProps {
  importId: string
  title: string
  entityType: "shops" | "users" | "flavors"
  onComplete?: (result: ImportResult) => void
  pollingInterval?: number
  autoStartPolling?: boolean
}

export interface ImportResult {
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  total: number
  processed: number
  successful: number
  failed: number
  errors: Array<{ id?: string; message: string }>
  warnings: Array<{ id?: string; message: string }>
  completedAt?: string
}

export default function ImportProgress({
  importId,
  title,
  entityType,
  onComplete,
  pollingInterval = 2000,
  autoStartPolling = true,
}: ImportProgressProps) {
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPolling, setIsPolling] = useState(autoStartPolling)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    const fetchProgress = async () => {
      try {
        const response = await fetch(`/api/admin/${entityType}/import/${importId}/progress`)

        if (!response.ok) {
          throw new Error(`Failed to fetch import progress: ${response.statusText}`)
        }

        const data = await response.json()
        setResult(data)

        // Stop polling if the import is complete or failed
        if (data.status === "completed" || data.status === "failed") {
          setIsPolling(false)
          if (onComplete) {
            onComplete(data)
          }

          // Show toast notification
          toast({
            title: data.status === "completed" ? "Import Completed" : "Import Failed",
            description:
              data.status === "completed"
                ? `Successfully imported ${data.successful} out of ${data.total} ${entityType}`
                : `Import failed with ${data.failed} errors`,
            variant: data.status === "completed" ? "default" : "destructive",
          })
        }
      } catch (err) {
        console.error("Error fetching import progress:", err)
        setError(err instanceof Error ? err.message : "Unknown error occurred")
        setIsPolling(false)
      }
    }

    if (isPolling) {
      // Fetch immediately
      fetchProgress()
      // Then set up interval
      intervalId = setInterval(fetchProgress, pollingInterval)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [importId, entityType, isPolling, pollingInterval, onComplete, toast])

  const startPolling = () => {
    setError(null)
    setIsPolling(true)
  }

  const getStatusColor = () => {
    if (!result) return "bg-gray-200"
    switch (result.status) {
      case "completed":
        return "bg-green-500"
      case "failed":
        return "bg-red-500"
      case "processing":
        return "bg-blue-500"
      default:
        return "bg-gray-200"
    }
  }

  const getStatusText = () => {
    if (!result) return "Initializing..."
    switch (result.status) {
      case "pending":
        return "Pending..."
      case "processing":
        return `Processing ${result.processed} of ${result.total} (${Math.round(result.progress)}%)`
      case "completed":
        return `Completed: ${result.successful} successful, ${result.failed} failed`
      case "failed":
        return "Import failed"
      default:
        return "Unknown status"
    }
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex flex-col gap-2">
          <p>{error}</p>
          <Button size="sm" variant="outline" onClick={startPolling} className="self-start">
            <RefreshCw className="mr-2 h-4 w-4" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          {result?.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
          {result?.status === "completed" && <CheckCircle2 className="h-4 w-4 text-green-500" />}
          {result?.status === "failed" && <AlertCircle className="h-4 w-4 text-red-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{getStatusText()}</span>
            <span>{result ? `${result.processed} of ${result.total}` : "Preparing..."}</span>
          </div>
          <Progress value={result?.progress || 0} className="h-2" indicatorClassName={getStatusColor()} />
        </div>

        {result && result.status !== "pending" && (
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded border border-green-100 bg-green-50 p-2 text-center">
              <div className="text-sm font-medium text-green-600">{result.successful}</div>
              <div className="text-xs text-muted-foreground">Successful</div>
            </div>
            <div className="rounded border border-yellow-100 bg-yellow-50 p-2 text-center">
              <div className="text-sm font-medium text-yellow-600">
                {result.processed - result.successful - result.failed}
              </div>
              <div className="text-xs text-muted-foreground">Skipped</div>
            </div>
            <div className="rounded border border-red-100 bg-red-50 p-2 text-center">
              <div className="text-sm font-medium text-red-600">{result.failed}</div>
              <div className="text-xs text-muted-foreground">Failed</div>
            </div>
          </div>
        )}

        {result?.errors && result.errors.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Errors ({result.errors.length})</h4>
            <div className="max-h-32 overflow-y-auto rounded border border-red-100 bg-red-50 p-2">
              <ul className="list-inside list-disc space-y-1">
                {result.errors.map((error, index) => (
                  <li key={index} className="text-xs text-red-700">
                    {error.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {result?.warnings && result.warnings.length > 0 && (
          <div className="mt-4">
            <h4 className="mb-2 text-sm font-medium">Warnings ({result.warnings.length})</h4>
            <div className="max-h-32 overflow-y-auto rounded border border-yellow-100 bg-yellow-50 p-2">
              <ul className="list-inside list-disc space-y-1">
                {result.warnings.map((warning, index) => (
                  <li key={index} className="text-xs text-yellow-700">
                    {warning.message}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
      {!isPolling && result?.status !== "completed" && (
        <CardFooter>
          <Button onClick={startPolling} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh Status
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
