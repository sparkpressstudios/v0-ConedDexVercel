"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, ArrowDown, ArrowUp, Calendar, Download, Filter, RefreshCw, Search } from "lucide-react"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { format } from "date-fns"
import { handleApiError, getUserFriendlyErrorMessage } from "@/lib/utils/handle-api-error"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

type AuditLog = {
  id: string
  action: string
  resource_type: string
  resource_id?: string
  details: any
  user_id: string
  ip_address?: string
  user_agent?: string
  created_at: string
  user_email?: string // Joined from users table
}

type AuditLogFilters = {
  action?: string
  resource_type?: string
  user_id?: string
  dateRange?: {
    from: Date
    to: Date
  }
  search?: string
}

type SortConfig = {
  key: keyof AuditLog
  direction: "asc" | "desc"
}

export default function AuditLogViewer() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState<string>("all")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const pageSize = 10

  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<AuditLogFilters>({})
  const [actions, setActions] = useState<string[]>([])
  const [resourceTypes, setResourceTypes] = useState<string[]>([])
  const [users, setUsers] = useState<{ id: string; email: string }[]>([])
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "created_at",
    direction: "desc",
  })
  const { toast } = useToast()

  // Fetch audit logs with pagination, filtering, and sorting
  const fetchLogsData = async () => {
    setLoading(true)
    setError(null)

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
        sortKey: sortConfig.key,
        sortDirection: sortConfig.direction,
      })

      // Add filters to query params
      if (filters.action) queryParams.append("action", filters.action)
      if (filters.resource_type) queryParams.append("resourceType", filters.resource_type)
      if (filters.user_id) queryParams.append("userId", filters.user_id)
      if (filters.search) queryParams.append("search", filters.search)

      if (filters.dateRange?.from) {
        queryParams.append("from", filters.dateRange.from.toISOString())
      }

      if (filters.dateRange?.to) {
        queryParams.append("to", filters.dateRange.to.toISOString())
      }

      const response = await fetch(`/api/admin/audit-logs?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to fetch audit logs")
      }

      const data = await response.json()
      setLogs(data.logs)
      setTotalPages(Math.ceil(data.total / pageSize))

      // Update filter options if this is the first load
      if (!actions.length) {
        setActions(data.actions || [])
      }

      if (!resourceTypes.length) {
        setResourceTypes(data.resourceTypes || [])
      }

      if (!users.length) {
        setUsers(data.users || [])
      }
    } catch (err) {
      const apiError = handleApiError(err)
      setError(getUserFriendlyErrorMessage(apiError))
      toast({
        variant: "destructive",
        title: "Error fetching audit logs",
        description: getUserFriendlyErrorMessage(apiError),
      })
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and refetch when dependencies change
  useEffect(() => {
    fetchLogsData()
  }, [page, sortConfig, filters])

  // Handle sorting
  const handleSort = (key: keyof AuditLog) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }))
  }

  // Export logs as CSV
  const exportLogs = async () => {
    try {
      const queryParams = new URLSearchParams({
        format: "csv",
        ...(filters as any),
      })

      const response = await fetch(`/api/admin/audit-logs/export?${queryParams.toString()}`)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to export audit logs")
      }

      // Create a download link
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.style.display = "none"
      a.href = url
      a.download = `audit-logs-${format(new Date(), "yyyy-MM-dd")}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Audit logs have been exported to CSV",
      })
    } catch (err) {
      const apiError = handleApiError(err)
      toast({
        variant: "destructive",
        title: "Export failed",
        description: getUserFriendlyErrorMessage(apiError),
      })
    }
  }

  // Format the details for display
  const formatDetails = (details: any) => {
    if (!details) return "No details"

    try {
      if (typeof details === "string") {
        return details
      }

      return JSON.stringify(details, null, 2)
    } catch (e) {
      return "Invalid details format"
    }
  }

  // Get badge color based on action
  const getActionBadgeColor = (action: string) => {
    switch (action.toUpperCase()) {
      case "CREATE":
        return "bg-green-100 text-green-800"
      case "UPDATE":
        return "bg-blue-100 text-blue-800"
      case "DELETE":
        return "bg-red-100 text-red-800"
      case "ERROR":
        return "bg-red-100 text-red-800"
      case "PRICE_SYNC_CHECK":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleActionFilterChange = (value: string) => {
    setActionFilter(value)
    setPage(1)
  }

  const filteredLogs = logs.filter((log) => {
    const searchTermLower = searchTerm.toLowerCase()
    return (
      log.action.toLowerCase().includes(searchTermLower) ||
      (log.user_email && log.user_email.toLowerCase().includes(searchTermLower)) ||
      (log.resource_type && log.resource_type.toLowerCase().includes(searchTermLower)) ||
      (log.resource_id && log.resource_id.toLowerCase().includes(searchTermLower))
    )
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Audit Logs</CardTitle>
            <CardDescription>Track all administrative actions and system events</CardDescription>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => fetchLogsData()} disabled={loading}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={exportLogs} disabled={loading}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setFilters({})} disabled={!Object.keys(filters).length}>
              Clear all
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Select
                value={filters.action || ""}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, action: value || undefined }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Actions</SelectItem>
                  {actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.resource_type || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, resource_type: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Resource Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Resources</SelectItem>
                  {resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Select
                value={filters.user_id || "all"}
                onValueChange={(value) =>
                  setFilters((prev) => ({ ...prev, user_id: value === "all" ? undefined : value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="User" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Users</SelectItem>
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <DateRangePicker
                  value={filters.dateRange}
                  onChange={(range) => setFilters((prev) => ({ ...prev, dateRange: range }))}
                />
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-sm items-center space-x-2">
            <Input
              placeholder="Search logs..."
              value={filters.search || ""}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value || undefined }))}
            />
            <Button type="submit" onClick={() => fetchLogsData()} disabled={loading}>
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 p-4 rounded-md mb-4 flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Logs table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Timestamp
                    {sortConfig.key === "created_at" &&
                      (sortConfig.direction === "asc" ? (
                        <ArrowUp className="h-4 w-4 ml-1" />
                      ) : (
                        <ArrowDown className="h-4 w-4 ml-1" />
                      ))}
                  </div>
                </TableHead>
                <TableHead>Action</TableHead>
                <TableHead>User Email</TableHead>
                <TableHead>Resource Type</TableHead>
                <TableHead>Resource ID</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>User Agent</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                // Display skeleton rows while loading
                [...Array(pageSize)].map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    {/* Adjust the number of TableCell components to match the number of columns */}
                    <TableCell>
                      <Skeleton className="h-4 w-[150px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[120px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableCell>
                  </TableRow>
                ))
              ) : logs.length === 0 ? (
                // Display message when there are no logs
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    No logs found.
                  </TableCell>
                </TableRow>
              ) : (
                // Display audit log data
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="font-medium">
                      {format(new Date(log.created_at), "yyyy-MM-dd HH:mm:ss")}
                    </TableCell>
                    <TableCell>
                      <Badge className={getActionBadgeColor(log.action)}>{log.action}</Badge>
                    </TableCell>
                    <TableCell>{log.user_email || "N/A"}</TableCell>
                    <TableCell>{log.resource_type || "N/A"}</TableCell>
                    <TableCell>{log.resource_id || "N/A"}</TableCell>
                    <TableCell>{log.ip_address || "N/A"}</TableCell>
                    <TableCell>{log.user_agent || "N/A"}</TableCell>
                    <TableCell>
                      <pre className="whitespace-pre-wrap">{formatDetails(log.details)}</pre>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        <Pagination>
          <PaginationContent>
            <PaginationPrevious
              href="#"
              onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
              disabled={page === 1}
            />
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
              <PaginationItem key={pageNumber} active={pageNumber === page}>
                <PaginationLink href="#" onClick={() => setPage(pageNumber)} isActive={pageNumber === page}>
                  {pageNumber}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationNext
              href="#"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={page === totalPages}
            />
          </PaginationContent>
        </Pagination>
      </CardContent>
    </Card>
  )
}
