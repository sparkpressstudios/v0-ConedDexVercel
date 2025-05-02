"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, FileText, Plus, Trash2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ScheduledReport {
  id: string
  type: "shop_report" | "flavor_catalog" | "analytics" | "custom"
  entityId: string
  entityName?: string
  schedule: string
  options: Record<string, any>
  lastRun?: string
  nextRun?: string
  enabled: boolean
  createdAt: string
}

export function ReportScheduler() {
  const [reports, setReports] = useState<ScheduledReport[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("scheduled")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  // New report form state
  const [newReport, setNewReport] = useState({
    type: "shop_report" as ScheduledReport["type"],
    entityId: "",
    schedule: "0 0 * * *", // Daily at midnight
    options: {},
    enabled: true,
  })

  // Fetch scheduled reports
  useEffect(() => {
    const fetchReports = async () => {
      try {
        const response = await fetch("/api/admin/reports/scheduled")
        if (!response.ok) throw new Error("Failed to fetch scheduled reports")

        const data = await response.json()
        setReports(data.reports)
      } catch (error) {
        console.error("Error fetching scheduled reports:", error)
        toast({
          title: "Error",
          description: "Failed to load scheduled reports",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchReports()
  }, [toast])

  // Handle creating a new scheduled report
  const handleCreateReport = async () => {
    try {
      const response = await fetch("/api/admin/reports/schedule", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newReport),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to schedule report")
      }

      const data = await response.json()

      setReports((prev) => [...prev, data.report])
      setIsDialogOpen(false)

      // Reset form
      setNewReport({
        type: "shop_report",
        entityId: "",
        schedule: "0 0 * * *",
        options: {},
        enabled: true,
      })

      toast({
        title: "Report Scheduled",
        description: "Your report has been scheduled successfully",
      })
    } catch (error) {
      console.error("Error scheduling report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to schedule report",
        variant: "destructive",
      })
    }
  }

  // Handle toggling report enabled status
  const handleToggleEnabled = async (reportId: string, enabled: boolean) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/toggle`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled }),
      })

      if (!response.ok) throw new Error("Failed to update report status")

      setReports((prev) => prev.map((report) => (report.id === reportId ? { ...report, enabled } : report)))

      toast({
        title: enabled ? "Report Enabled" : "Report Disabled",
        description: `The scheduled report has been ${enabled ? "enabled" : "disabled"}`,
      })
    } catch (error) {
      console.error("Error updating report status:", error)
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      })
    }
  }

  // Handle deleting a report
  const handleDeleteReport = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete report")

      setReports((prev) => prev.filter((report) => report.id !== reportId))

      toast({
        title: "Report Deleted",
        description: "The scheduled report has been deleted",
      })
    } catch (error) {
      console.error("Error deleting report:", error)
      toast({
        title: "Error",
        description: "Failed to delete report",
        variant: "destructive",
      })
    }
  }

  // Handle running a report immediately
  const handleRunNow = async (reportId: string) => {
    try {
      const response = await fetch(`/api/admin/reports/${reportId}/run`, {
        method: "POST",
      })

      if (!response.ok) throw new Error("Failed to run report")

      toast({
        title: "Report Running",
        description: "The report is being generated and will be available shortly",
      })
    } catch (error) {
      console.error("Error running report:", error)
      toast({
        title: "Error",
        description: "Failed to run report",
        variant: "destructive",
      })
    }
  }

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Never"
    return new Date(dateString).toLocaleString()
  }

  // Get entity name based on type and ID
  const getEntityName = (type: string, entityId: string) => {
    switch (type) {
      case "shop_report":
        return `Shop #${entityId}`
      case "flavor_catalog":
        return `Shop #${entityId} Flavors`
      case "analytics":
        return "Platform Analytics"
      case "custom":
        return "Custom Report"
      default:
        return entityId
    }
  }

  // Format schedule for display
  const formatSchedule = (schedule: string) => {
    // Simple cron expression formatter
    const parts = schedule.split(" ")
    if (parts.length !== 5) return schedule

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts

    if (minute === "0" && hour === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return "Daily at midnight"
    }

    if (minute === "0" && dayOfMonth === "*" && month === "*" && dayOfWeek === "*") {
      return `Daily at ${hour}:00`
    }

    if (dayOfMonth === "*" && month === "*" && dayOfWeek === "1") {
      return `Every Monday at ${hour}:${minute.padStart(2, "0")}`
    }

    return schedule
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Report Scheduler</CardTitle>
          <CardDescription>Schedule automated report generation</CardDescription>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Schedule New Report</DialogTitle>
              <DialogDescription>Create a new scheduled report that will run automatically</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="report-type">Report Type</Label>
                <Select
                  value={newReport.type}
                  onValueChange={(value) => setNewReport({ ...newReport, type: value as ScheduledReport["type"] })}
                >
                  <SelectTrigger id="report-type">
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="shop_report">Shop Report</SelectItem>
                    <SelectItem value="flavor_catalog">Flavor Catalog</SelectItem>
                    <SelectItem value="analytics">Analytics Report</SelectItem>
                    <SelectItem value="custom">Custom Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="entity-id">Entity ID</Label>
                <Input
                  id="entity-id"
                  placeholder="Enter shop ID or entity ID"
                  value={newReport.entityId}
                  onChange={(e) => setNewReport({ ...newReport, entityId: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="schedule">Schedule (Cron Expression)</Label>
                <Input
                  id="schedule"
                  placeholder="0 0 * * *"
                  value={newReport.schedule}
                  onChange={(e) => setNewReport({ ...newReport, schedule: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">Default: Daily at midnight (0 0 * * *)</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="enabled"
                  checked={newReport.enabled}
                  onCheckedChange={(checked) => setNewReport({ ...newReport, enabled: checked })}
                />
                <Label htmlFor="enabled">Enable schedule immediately</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport}>Schedule Report</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
            <TabsTrigger value="history">Report History</TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : reports.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Scheduled Reports</h3>
                <p className="text-muted-foreground max-w-md mt-1">
                  Create your first scheduled report to automate report generation.
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Entity</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.type.replace("_", " ")}</TableCell>
                      <TableCell>{report.entityName || getEntityName(report.type, report.entityId)}</TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatSchedule(report.schedule)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                          {formatDate(report.nextRun)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                            checked={report.enabled}
                            onCheckedChange={(checked) => handleToggleEnabled(report.id, checked)}
                            aria-label={report.enabled ? "Enabled" : "Disabled"}
                          />
                          <span className="ml-2 text-xs">{report.enabled ? "Enabled" : "Disabled"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRunNow(report.id)}
                            disabled={!report.enabled}
                          >
                            Run Now
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteReport(report.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </TabsContent>

          <TabsContent value="history">
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Report History</h3>
              <p className="text-muted-foreground max-w-md mt-1">
                View the history of generated reports and their status.
              </p>
              <Button className="mt-4" onClick={() => router.push("/dashboard/admin/reports/history")}>
                View Full History
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
