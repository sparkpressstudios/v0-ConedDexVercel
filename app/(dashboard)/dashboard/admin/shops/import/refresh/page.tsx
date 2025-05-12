"use client"

import { useState } from "react"
import { Loader2, RefreshCw, ArrowLeft, Check, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { refreshAllShops } from "@/app/actions/enhanced-shop-import"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export default function RefreshShopsPage() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [refreshProgress, setRefreshProgress] = useState(0)
  const [refreshStats, setRefreshStats] = useState({
    total: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
  })
  const [options, setOptions] = useState({
    validateBeforeImport: true,
    updateExisting: true,
    importPhotos: true,
  })
  const { toast } = useToast()

  const handleRefresh = async () => {
    setIsRefreshing(true)
    setRefreshProgress(0)
    setRefreshStats({
      total: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
    })

    try {
      const result = await refreshAllShops({
        validateBeforeImport: options.validateBeforeImport,
        updateExisting: options.updateExisting,
        importPhotos: options.importPhotos,
      })

      setRefreshStats({
        total: result.imported + result.skipped + result.failed,
        updated: result.imported,
        skipped: result.skipped,
        failed: result.failed,
      })

      setRefreshProgress(100)

      toast({
        title: "Refresh complete",
        description: result.message,
      })
    } catch (error) {
      console.error("Error refreshing shops:", error)
      toast({
        title: "Refresh failed",
        description: error.message || "An error occurred while refreshing shops",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Refresh Shops</h1>
          <p className="text-muted-foreground">Update existing shops with the latest data from Google Places</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/admin/shops/import">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Import Options
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refresh Options</CardTitle>
          <CardDescription>Configure how shops should be refreshed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="validate">Validate Data</Label>
              <p className="text-sm text-muted-foreground">Validate shop data before updating</p>
            </div>
            <Switch
              id="validate"
              checked={options.validateBeforeImport}
              onCheckedChange={(checked) => setOptions({ ...options, validateBeforeImport: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="photos">Update Photos</Label>
              <p className="text-sm text-muted-foreground">Refresh shop photos during update</p>
            </div>
            <Switch
              id="photos"
              checked={options.importPhotos}
              onCheckedChange={(checked) => setOptions({ ...options, importPhotos: checked })}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full">
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing Shops...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh All Shops
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {isRefreshing && (
        <Card>
          <CardHeader>
            <CardTitle>Refresh Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={refreshProgress} />
            <p className="text-center text-sm text-muted-foreground">
              This may take several minutes depending on the number of shops.
            </p>
          </CardContent>
        </Card>
      )}

      {refreshStats.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Refresh Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{refreshStats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{refreshStats.updated}</div>
                <div className="text-xs text-muted-foreground">Updated</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{refreshStats.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{refreshStats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {refreshStats.updated > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-green-200 bg-green-50 p-3">
                  <Check className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-green-900">Successfully Updated</h4>
                    <p className="text-sm text-green-700">
                      {refreshStats.updated} shops were successfully updated with the latest data.
                    </p>
                  </div>
                </div>
              )}

              {refreshStats.failed > 0 && (
                <div className="flex items-start gap-2 rounded-md border border-red-200 bg-red-50 p-3">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900">Update Failures</h4>
                    <p className="text-sm text-red-700">
                      {refreshStats.failed} shops could not be updated. This may be due to API rate limits or data
                      validation issues.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/admin/shops">View All Shops</Link>
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
