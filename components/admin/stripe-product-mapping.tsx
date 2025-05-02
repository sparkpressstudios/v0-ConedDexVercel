"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Loader2, RefreshCw, Check, X, AlertTriangle, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StripeMapping {
  id: string
  subscription_tier_id: string
  stripe_product_id: string
  stripe_price_id: string
  billing_period: string
  is_active: boolean
  tier_name?: string
  price_amount?: number
}

export function StripeProductMapping() {
  const [mappings, setMappings] = useState<StripeMapping[]>([])
  const [filteredMappings, setFilteredMappings] = useState<StripeMapping[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [billingFilter, setBillingFilter] = useState<string>("all")
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    title: string
    description: string
    action: () => Promise<void>
  }>({
    isOpen: false,
    title: "",
    description: "",
    action: async () => {},
  })
  const [syncStatus, setSyncStatus] = useState<{
    inSync: boolean
    outOfSyncCount: number
    lastChecked: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchMappings()
    checkPriceSync()
  }, [])

  useEffect(() => {
    // Apply filters whenever the filter state or mappings change
    applyFilters()
  }, [searchTerm, statusFilter, billingFilter, mappings])

  async function fetchMappings() {
    try {
      setIsLoading(true)
      setError(null)

      // Get all mappings with tier names
      const { data, error } = await supabase
        .from("subscription_tiers_stripe_mapping")
        .select(`
          *,
          subscription_tiers:subscription_tier_id (name)
        `)
        .order("is_active", { ascending: false })

      if (error) {
        throw error
      }

      // Format the data to include tier_name
      const formattedData = data.map((item) => ({
        ...item,
        tier_name: item.subscription_tiers?.name,
      }))

      setMappings(formattedData)
    } catch (error: any) {
      console.error("Error fetching mappings:", error)
      setError(`Failed to load Stripe product mappings: ${error.message || "Unknown error"}`)
      toast({
        title: "Error",
        description: "Failed to load Stripe product mappings.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  async function updateMapping(id: string, data: Partial<StripeMapping>) {
    try {
      setIsUpdating(true)
      setError(null)

      const { error } = await supabase.from("subscription_tiers_stripe_mapping").update(data).eq("id", id)

      if (error) {
        throw error
      }

      // Log the action to the audit log
      await supabase.from("admin_audit_log").insert({
        action: "update_mapping",
        entity_type: "stripe_mapping",
        entity_id: id,
        details: { updated_fields: Object.keys(data) },
      })

      toast({
        title: "Success",
        description: "Mapping updated successfully.",
      })

      // Refresh the mappings
      fetchMappings()
    } catch (error: any) {
      console.error("Error updating mapping:", error)
      setError(`Failed to update mapping: ${error.message || "Unknown error"}`)
      toast({
        title: "Error",
        description: "Failed to update mapping.",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  async function toggleMappingStatus(id: string, currentStatus: boolean) {
    setConfirmDialog({
      isOpen: true,
      title: currentStatus ? "Deactivate Mapping" : "Activate Mapping",
      description: currentStatus
        ? "Are you sure you want to deactivate this mapping? This will prevent customers from purchasing this subscription tier."
        : "Are you sure you want to activate this mapping? This will make this subscription tier available for purchase.",
      action: async () => {
        await updateMapping(id, { is_active: !currentStatus })
      },
    })
  }

  async function syncWithStripe() {
    try {
      setIsSyncing(true)
      setError(null)

      // Call the API to sync with Stripe
      const response = await fetch("/api/admin/stripe/sync-products", {
        method: "POST",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to sync with Stripe")
      }

      // Log the action to the audit log
      await supabase.from("admin_audit_log").insert({
        action: "sync_products",
        details: { timestamp: new Date().toISOString() },
      })

      toast({
        title: "Success",
        description: "Successfully synced with Stripe.",
      })

      // Refresh the mappings
      fetchMappings()
      // Check price sync status
      checkPriceSync()
    } catch (error: any) {
      console.error("Error syncing with Stripe:", error)
      setError(`Failed to sync with Stripe: ${error.message || "Unknown error"}`)
      toast({
        title: "Error",
        description: `Failed to sync with Stripe: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setIsSyncing(false)
    }
  }

  async function checkPriceSync() {
    try {
      const response = await fetch("/api/admin/stripe/check-price-sync")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to check price sync")
      }

      const data = await response.json()
      setSyncStatus(data)

      if (!data.inSync) {
        toast({
          title: "Price Discrepancy Detected",
          description: `${data.outOfSyncCount} products have price differences between ConeDex and Stripe.`,
          variant: "warning",
        })
      }
    } catch (error: any) {
      console.error("Error checking price sync:", error)
      // Don't show a toast for this error as it's not critical
    }
  }

  function applyFilters() {
    let result = [...mappings]

    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase()
      result = result.filter(
        (mapping) =>
          mapping.tier_name?.toLowerCase().includes(lowerSearchTerm) ||
          mapping.stripe_product_id.toLowerCase().includes(lowerSearchTerm) ||
          mapping.stripe_price_id.toLowerCase().includes(lowerSearchTerm),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      result = result.filter((mapping) => mapping.is_active === isActive)
    }

    // Apply billing period filter
    if (billingFilter !== "all") {
      result = result.filter((mapping) => mapping.billing_period === billingFilter)
    }

    setFilteredMappings(result)
  }

  function formatCurrency(amount: number | undefined) {
    if (amount === undefined) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-12 w-12 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Error Loading Stripe Mappings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
          <Button onClick={fetchMappings} className="mt-4">
            Retry
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Stripe Product Mappings</CardTitle>
          <CardDescription>
            Manage the mapping between ConeDex subscription tiers and Stripe products/prices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-2">
              <Button onClick={syncWithStripe} disabled={isUpdating || isSyncing} className="flex items-center gap-2">
                {isSyncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Sync with Stripe
              </Button>

              {syncStatus && (
                <div className="ml-4 flex items-center gap-2">
                  <Badge variant={syncStatus.inSync ? "outline" : "destructive"}>
                    {syncStatus.inSync ? "Prices In Sync" : `${syncStatus.outOfSyncCount} Price Discrepancies`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Last checked: {new Date(syncStatus.lastChecked).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search mappings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 w-full md:w-[200px]"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>

              <Select value={billingFilter} onValueChange={setBillingFilter}>
                <SelectTrigger className="w-full md:w-[150px]">
                  <SelectValue placeholder="Billing Period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Periods</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {filteredMappings.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">No mappings found matching your filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tier Name</TableHead>
                    <TableHead>Billing Period</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Stripe Product ID</TableHead>
                    <TableHead>Stripe Price ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map((mapping) => (
                    <TableRow key={mapping.id}>
                      <TableCell>{mapping.tier_name}</TableCell>
                      <TableCell className="capitalize">{mapping.billing_period}</TableCell>
                      <TableCell>{formatCurrency(mapping.price_amount)}</TableCell>
                      <TableCell className="font-mono text-xs max-w-[150px] truncate" title={mapping.stripe_product_id}>
                        {mapping.stripe_product_id}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[150px] truncate" title={mapping.stripe_price_id}>
                        {mapping.stripe_price_id}
                      </TableCell>
                      <TableCell>
                        {mapping.is_active ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                            Inactive
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleMappingStatus(mapping.id, mapping.is_active)}
                          disabled={isUpdating}
                          className="flex items-center gap-1"
                        >
                          {mapping.is_active ? (
                            <>
                              <X className="h-3 w-3" />
                              <span className="hidden sm:inline">Deactivate</span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3 w-3" />
                              <span className="hidden sm:inline">Activate</span>
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={confirmDialog.isOpen}
        onOpenChange={(isOpen) => setConfirmDialog({ ...confirmDialog, isOpen })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirmDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirmDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                await confirmDialog.action()
                setConfirmDialog({ ...confirmDialog, isOpen: false })
              }}
            >
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
