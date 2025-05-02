"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"
import { BarChart, Calendar, Download, LineChart, PieChart, Plus, Save, Table2 } from "lucide-react"

// Sample saved reports
const savedReports = [
  {
    id: 1,
    name: "Monthly User Growth",
    description: "User growth trends over the past 12 months",
    type: "line",
    lastRun: "2023-04-15",
    schedule: "Monthly",
  },
  {
    id: 2,
    name: "Flavor Logging by Category",
    description: "Distribution of flavor logs across categories",
    type: "pie",
    lastRun: "2023-04-10",
    schedule: "Weekly",
  },
  {
    id: 3,
    name: "Shop Engagement Metrics",
    description: "Detailed metrics for shop page engagement",
    type: "bar",
    lastRun: "2023-04-18",
    schedule: "Weekly",
  },
  {
    id: 4,
    name: "Subscription Conversion Funnel",
    description: "Conversion rates through the subscription process",
    type: "funnel",
    lastRun: "2023-04-05",
    schedule: "Monthly",
  },
]

export function CustomReports() {
  const [activeTab, setActiveTab] = useState("saved")
  const [reportName, setReportName] = useState("")
  const [reportDescription, setReportDescription] = useState("")
  const [reportType, setReportType] = useState("line")
  const [reportSchedule, setReportSchedule] = useState("none")
  const [selectedMetrics, setSelectedMetrics] = useState({
    users: true,
    sessions: true,
    pageViews: false,
    flavorLogs: true,
    shopViews: false,
    conversions: false,
  })

  const handleMetricChange = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }))
  }

  const handleCreateReport = () => {
    // In a real app, this would save the report configuration
    alert("Report created successfully!")
    setActiveTab("saved")
  }

  const getReportIcon = (type: string) => {
    switch (type) {
      case "line":
        return <LineChart className="h-4 w-4" />
      case "bar":
        return <BarChart className="h-4 w-4" />
      case "pie":
        return <PieChart className="h-4 w-4" />
      case "funnel":
        return <Table2 className="h-4 w-4" />
      default:
        return <LineChart className="h-4 w-4" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Custom Reports</CardTitle>
        <CardDescription>Create and manage custom analytics reports</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="saved">Saved Reports</TabsTrigger>
            <TabsTrigger value="create">Create Report</TabsTrigger>
            <TabsTrigger value="scheduled">Scheduled Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="saved" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Your Reports</h3>
              <Button variant="outline" size="sm" onClick={() => setActiveTab("create")}>
                <Plus className="h-4 w-4 mr-1" /> New Report
              </Button>
            </div>

            <div className="grid gap-4">
              {savedReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 p-2 rounded-md bg-primary/10">{getReportIcon(report.type)}</div>
                        <div>
                          <h3 className="font-medium">{report.name}</h3>
                          <p className="text-sm text-muted-foreground">{report.description}</p>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3 mr-1" />
                              Last run: {report.lastRun}
                            </div>
                            {report.schedule !== "none" && (
                              <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {report.schedule}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Download className="h-3.5 w-3.5 mr-1" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="report-name">Report Name</Label>
                <Input
                  id="report-name"
                  placeholder="e.g., Monthly User Growth"
                  value={reportName}
                  onChange={(e) => setReportName(e.target.value)}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-description">Description</Label>
                <Textarea
                  id="report-description"
                  placeholder="Describe what this report shows"
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="report-type">Chart Type</Label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger id="report-type">
                      <SelectValue placeholder="Select chart type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="line">Line Chart</SelectItem>
                      <SelectItem value="bar">Bar Chart</SelectItem>
                      <SelectItem value="pie">Pie Chart</SelectItem>
                      <SelectItem value="funnel">Funnel Chart</SelectItem>
                      <SelectItem value="table">Data Table</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="report-schedule">Schedule</Label>
                  <Select value={reportSchedule} onValueChange={setReportSchedule}>
                    <SelectTrigger id="report-schedule">
                      <SelectValue placeholder="Select schedule" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Schedule (On-demand)</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label>Metrics to Include</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-users"
                      checked={selectedMetrics.users}
                      onCheckedChange={() => handleMetricChange("users")}
                    />
                    <Label htmlFor="metric-users">Users</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-sessions"
                      checked={selectedMetrics.sessions}
                      onCheckedChange={() => handleMetricChange("sessions")}
                    />
                    <Label htmlFor="metric-sessions">Sessions</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-pageViews"
                      checked={selectedMetrics.pageViews}
                      onCheckedChange={() => handleMetricChange("pageViews")}
                    />
                    <Label htmlFor="metric-pageViews">Page Views</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-flavorLogs"
                      checked={selectedMetrics.flavorLogs}
                      onCheckedChange={() => handleMetricChange("flavorLogs")}
                    />
                    <Label htmlFor="metric-flavorLogs">Flavor Logs</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-shopViews"
                      checked={selectedMetrics.shopViews}
                      onCheckedChange={() => handleMetricChange("shopViews")}
                    />
                    <Label htmlFor="metric-shopViews">Shop Views</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="metric-conversions"
                      checked={selectedMetrics.conversions}
                      onCheckedChange={() => handleMetricChange("conversions")}
                    />
                    <Label htmlFor="metric-conversions">Conversions</Label>
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="report-filters">Filters (Optional)</Label>
                <Textarea id="report-filters" placeholder="e.g., date_range:last_30_days, platform:mobile" />
                <p className="text-xs text-muted-foreground">Enter filters in key:value format, separated by commas</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="scheduled" className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium">Scheduled Reports</h3>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" /> Schedule Report
              </Button>
            </div>

            <div className="grid gap-4">
              {savedReports
                .filter((report) => report.schedule !== "none")
                .map((report) => (
                  <Card key={report.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 p-2 rounded-md bg-primary/10">{getReportIcon(report.type)}</div>
                          <div>
                            <h3 className="font-medium">{report.name}</h3>
                            <p className="text-sm text-muted-foreground">{report.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Calendar className="h-3 w-3 mr-1" />
                                Next run: {report.schedule === "Weekly" ? "2023-04-24" : "2023-05-01"}
                              </div>
                              <div className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                {report.schedule}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-destructive">
                            Disable
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      {activeTab === "create" && (
        <CardFooter className="flex justify-between border-t px-6 py-4">
          <Button variant="outline" onClick={() => setActiveTab("saved")}>
            Cancel
          </Button>
          <Button onClick={handleCreateReport} disabled={!reportName}>
            <Save className="h-4 w-4 mr-1" /> Create Report
          </Button>
        </CardFooter>
      )}
    </Card>
  )
}
