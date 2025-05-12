"use client"

import { Suspense } from "react"
import { format } from "date-fns"
import { ArrowUpDown, Download, Filter, Search, User, FileText, Tag, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { getAuditLogs } from "@/app/actions/admin/audit-log-actions"
import { AuditLogDetails } from "@/components/admin/audit-log-details"

export const dynamic = "force-dynamic"

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: {
    page?: string
    limit?: string
    action?: string
    entity?: string
    admin?: string
    from?: string
    to?: string
  }
}) {
  const page = Number.parseInt(searchParams.page || "1")
  const limit = Number.parseInt(searchParams.limit || "50")
  const offset = (page - 1) * limit

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Track and review all administrative actions in the system</p>
      </div>

      <Tabs defaultValue="all">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Logs</TabsTrigger>
            <TabsTrigger value="users">User Changes</TabsTrigger>
            <TabsTrigger value="shops">Shop Changes</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscription Changes</TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
            </Button>
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium">Admin User</label>
            <Select defaultValue={searchParams.admin || ""}>
              <SelectTrigger>
                <SelectValue placeholder="All admins" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All admins</SelectItem>
                <SelectItem value="admin1">John Admin</SelectItem>
                <SelectItem value="admin2">Sarah Manager</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Action Type</label>
            <Select defaultValue={searchParams.action || ""}>
              <SelectTrigger>
                <SelectValue placeholder="All actions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All actions</SelectItem>
                <SelectItem value="create">Create</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="delete">Delete</SelectItem>
                <SelectItem value="approve">Approve</SelectItem>
                <SelectItem value="reject">Reject</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Entity Type</label>
            <Select defaultValue={searchParams.entity || ""}>
              <SelectTrigger>
                <SelectValue placeholder="All entities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entities</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="shop">Shop</SelectItem>
                <SelectItem value="flavor">Flavor</SelectItem>
                <SelectItem value="subscription">Subscription</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium">Date Range</label>
            <div className="flex gap-2">
              <Input type="date" placeholder="From" defaultValue={searchParams.from} className="w-full" />
              <Input type="date" placeholder="To" defaultValue={searchParams.to} className="w-full" />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search logs by ID, admin, or entity..." className="w-full pl-8" />
          </div>
        </div>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>All Administrative Actions</CardTitle>
              <CardDescription>Complete history of all administrative actions in the system</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<AuditLogTableSkeleton />}>
                <AuditLogTable
                  limit={limit}
                  offset={offset}
                  actionType={searchParams.action as any}
                  entityType={searchParams.entity as any}
                  adminId={searchParams.admin}
                  startDate={searchParams.from ? new Date(searchParams.from) : undefined}
                  endDate={searchParams.to ? new Date(searchParams.to) : undefined}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>User Management Logs</CardTitle>
              <CardDescription>History of user creation, updates, and permission changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<AuditLogTableSkeleton />}>
                <AuditLogTable
                  limit={limit}
                  offset={offset}
                  entityType="user"
                  adminId={searchParams.admin}
                  startDate={searchParams.from ? new Date(searchParams.from) : undefined}
                  endDate={searchParams.to ? new Date(searchParams.to) : undefined}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shops" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Shop Management Logs</CardTitle>
              <CardDescription>History of shop creation, updates, and verification changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<AuditLogTableSkeleton />}>
                <AuditLogTable
                  limit={limit}
                  offset={offset}
                  entityType="shop"
                  adminId={searchParams.admin}
                  startDate={searchParams.from ? new Date(searchParams.from) : undefined}
                  endDate={searchParams.to ? new Date(searchParams.to) : undefined}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subscriptions" className="mt-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>Subscription Management Logs</CardTitle>
              <CardDescription>History of subscription plan and feature changes</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<AuditLogTableSkeleton />}>
                <AuditLogTable
                  limit={limit}
                  offset={offset}
                  entityType="subscription"
                  adminId={searchParams.admin}
                  startDate={searchParams.from ? new Date(searchParams.from) : undefined}
                  endDate={searchParams.to ? new Date(searchParams.to) : undefined}
                />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

async function AuditLogTable({
  limit = 50,
  offset = 0,
  actionType,
  entityType,
  adminId,
  startDate,
  endDate,
}: {
  limit?: number
  offset?: number
  actionType?: string
  entityType?: string
  adminId?: string
  startDate?: Date
  endDate?: Date
}) {
  const { logs, total, success, error } = await getAuditLogs({
    limit,
    offset,
    actionType: actionType as any,
    entityType: entityType as any,
    adminId,
    startDate,
    endDate,
  })

  if (!success) {
    return (
      <div className="py-8 text-center">
        <p className="text-red-500">Error loading audit logs: {error}</p>
      </div>
    )
  }

  if (logs.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No audit logs found matching your criteria.</p>
      </div>
    )
  }

  const currentPage = Math.floor(offset / limit) + 1
  const totalPages = Math.ceil(total / limit)

  return (
    <div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  Timestamp
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Admin
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  Action
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  <Tag className="mr-2 h-4 w-4" />
                  Entity
                </div>
              </TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {format(new Date(log.created_at), "MMM d, yyyy HH:mm:ss")}
                </TableCell>
                <TableCell>{log.admin_name || log.admin_email}</TableCell>
                <TableCell>
                  <ActionBadge action={log.action_type} />
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="capitalize">{log.entity_type}</span>
                    {log.entity_id && (
                      <span className="text-xs text-muted-foreground">ID: {log.entity_id.substring(0, 8)}...</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <AuditLogDetails log={log} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {offset + 1}-{Math.min(offset + logs.length, total)} of {total} logs
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => {
              // Handle pagination
            }}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => {
              // Handle pagination
            }}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

function ActionBadge({ action }: { action: string }) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "outline"

  switch (action) {
    case "create":
      variant = "default"
      break
    case "update":
      variant = "secondary"
      break
    case "delete":
      variant = "destructive"
      break
    case "approve":
      variant = "default"
      break
    case "reject":
      variant = "destructive"
      break
    default:
      variant = "outline"
  }

  return (
    <Badge variant={variant} className="capitalize">
      {action}
    </Badge>
  )
}

function AuditLogTableSkeleton() {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Timestamp</TableHead>
            <TableHead>Admin</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Entity</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.from({ length: 10 }).map((_, i) => (
            <TableRow key={i}>
              <TableCell>
                <Skeleton className="h-4 w-32" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-24" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-6 w-16" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-20" />
              </TableCell>
              <TableCell>
                <Skeleton className="h-4 w-full" />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
