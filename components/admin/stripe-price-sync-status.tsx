"use client"

import { useEffect, useState } from "react"
import { AlertTriangle, CheckCircle, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PriceSyncStatus {
  inSync: boolean
  outOfSyncCount: number
  lastChecked: string
}

export function StripePriceSyncStatus() {
  const [status, setStatus] = useState<PriceSyncStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkPriceSync = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/admin/stripe/check-price-sync")

      if (!response.ok) {
        throw new Error("Failed to check price sync status")
      }

      const data = await response.json()
      setStatus(data)
    } catch (err) {
      setError("Failed to check price sync status. Please try again.")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkPriceSync()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {status?.inSync ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-amber-500" />
          )}
          Stripe Price Sync Status
        </CardTitle>
        <CardDescription>
          Last checked: {status?.lastChecked ? new Date(status.lastChecked).toLocaleString() : "Never"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {status && (
          <div className="space-y-4">
            {status.inSync ? (
              <Alert variant="default" className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <AlertTitle>All prices are in sync</AlertTitle>
                <AlertDescription>ConeDex prices match Stripe prices for all product mappings.</AlertDescription>
              </Alert>
            ) : (
              <Alert variant="warning">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Price discrepancies detected</AlertTitle>
                <AlertDescription>
                  {status.outOfSyncCount} product{status.outOfSyncCount !== 1 ? "s" : ""} have different prices in
                  ConeDex compared to Stripe. Please review the mappings below and update as needed.
                </AlertDescription>
              </Alert>
            )}

            <Button onClick={checkPriceSync} disabled={loading} variant="outline" className="flex items-center gap-2">
              {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh Status
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
