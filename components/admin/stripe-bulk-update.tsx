"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, ArrowUpDown, Check, Loader2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

interface ProductMapping {
  id: string
  conedex_product_id: string
  conedex_product_name: string
  stripe_product_id: string
  stripe_price_id: string
  price_amount: number
  stripe_price_amount?: number
  is_out_of_sync?: boolean
}

export function StripeBulkUpdate({ mappings }: { mappings: ProductMapping[] }) {
  const [selectedMappings, setSelectedMappings] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Add stripe_price_amount and is_out_of_sync flags
  const enhancedMappings = mappings.map((mapping) => ({
    ...mapping,
    stripe_price_amount: mapping.stripe_price_amount || 0,
    is_out_of_sync: mapping.stripe_price_amount !== mapping.price_amount,
  }))

  // Filter to only show out of sync mappings
  const outOfSyncMappings = enhancedMappings.filter((m) => m.is_out_of_sync)

  const handleSelectAll = () => {
    if (selectedMappings.length === outOfSyncMappings.length) {
      setSelectedMappings([])
    } else {
      setSelectedMappings(outOfSyncMappings.map((m) => m.id))
    }
  }

  const handleSelectMapping = (id: string) => {
    if (selectedMappings.includes(id)) {
      setSelectedMappings(selectedMappings.filter((m) => m !== id))
    } else {
      setSelectedMappings([...selectedMappings, id])
    }
  }

  const handleBulkUpdate = async () => {
    try {
      setLoading(true)
      setError(null)
      setSuccess(false)

      // Call API to update selected mappings
      const response = await fetch("/api/admin/stripe/bulk-update-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mappingIds: selectedMappings,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update prices")
      }

      setSuccess(true)
      setSelectedMappings([])

      // Refresh the page after successful update
      setTimeout(() => {
        window.location.reload()
      }, 1500)
    } catch (err: any) {
      setError(err.message || "An error occurred while updating prices")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (outOfSyncMappings.length === 0) {
    return null
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-amber-500" />
          Price Discrepancies
        </CardTitle>
        <CardDescription>
          The following products have different prices in ConeDex compared to Stripe. Select the products you want to
          update and choose an action.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Check className="h-4 w-4 text-green-500" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Prices have been updated successfully.</AlertDescription>
          </Alert>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedMappings.length === outOfSyncMappings.length && outOfSyncMappings.length > 0}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead className="text-right">ConeDex Price</TableHead>
              <TableHead className="text-right">Stripe Price</TableHead>
              <TableHead className="text-right">Difference</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {outOfSyncMappings.map((mapping) => (
              <TableRow key={mapping.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedMappings.includes(mapping.id)}
                    onCheckedChange={() => handleSelectMapping(mapping.id)}
                    aria-label={`Select ${mapping.conedex_product_name}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="font-medium">{mapping.conedex_product_name}</div>
                  <div className="text-sm text-muted-foreground">ID: {mapping.conedex_product_id}</div>
                </TableCell>
                <TableCell className="text-right font-medium">${mapping.price_amount.toFixed(2)}</TableCell>
                <TableCell className="text-right font-medium">${mapping.stripe_price_amount?.toFixed(2)}</TableCell>
                <TableCell className="text-right">
                  <Badge variant={mapping.price_amount > mapping.stripe_price_amount! ? "destructive" : "default"}>
                    <ArrowUpDown className="h-3 w-3 mr-1" />$
                    {Math.abs(mapping.price_amount - mapping.stripe_price_amount!).toFixed(2)}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {selectedMappings.length} of {outOfSyncMappings.length} selected
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setSelectedMappings([])}
            disabled={selectedMappings.length === 0 || loading}
          >
            Clear Selection
          </Button>
          <Button onClick={handleBulkUpdate} disabled={selectedMappings.length === 0 || loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Selected Prices"
            )}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}
