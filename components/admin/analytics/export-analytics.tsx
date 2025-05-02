"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Download, FileSpreadsheet, FileIcon as FilePdf } from "lucide-react"

export function ExportAnalytics() {
  const [format, setFormat] = useState("csv")
  const [timeframe, setTimeframe] = useState("30d")
  const [selectedMetrics, setSelectedMetrics] = useState({
    installations: true,
    engagement: true,
    platforms: true,
    features: true,
    retention: true,
  })

  const handleMetricChange = (metric: keyof typeof selectedMetrics) => {
    setSelectedMetrics((prev) => ({
      ...prev,
      [metric]: !prev[metric],
    }))
  }

  const handleExport = () => {
    // In a real app, this would trigger an API call to generate and download the export
    console.log("Exporting analytics:", {
      format,
      timeframe,
      metrics: Object.entries(selectedMetrics)
        .filter(([_, selected]) => selected)
        .map(([metric]) => metric),
    })

    // Simulate download
    alert("Export started! Your file will download shortly.")
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Analytics Data</CardTitle>
        <CardDescription>Download analytics data for reporting and further analysis</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select value={format} onValueChange={setFormat}>
              <SelectTrigger id="format">
                <SelectValue placeholder="Select format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">CSV</SelectItem>
                <SelectItem value="excel">Excel</SelectItem>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timeframe">Time Period</Label>
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger id="timeframe">
                <SelectValue placeholder="Select timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Metrics to Include</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="installations"
                checked={selectedMetrics.installations}
                onCheckedChange={() => handleMetricChange("installations")}
              />
              <Label htmlFor="installations">Installations</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="engagement"
                checked={selectedMetrics.engagement}
                onCheckedChange={() => handleMetricChange("engagement")}
              />
              <Label htmlFor="engagement">User Engagement</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="platforms"
                checked={selectedMetrics.platforms}
                onCheckedChange={() => handleMetricChange("platforms")}
              />
              <Label htmlFor="platforms">Platform Breakdown</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="features"
                checked={selectedMetrics.features}
                onCheckedChange={() => handleMetricChange("features")}
              />
              <Label htmlFor="features">Feature Usage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="retention"
                checked={selectedMetrics.retention}
                onCheckedChange={() => handleMetricChange("retention")}
              />
              <Label htmlFor="retention">User Retention</Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex items-center text-sm text-muted-foreground">
          {format === "csv" || format === "excel" ? (
            <FileSpreadsheet className="mr-2 h-4 w-4" />
          ) : (
            <FilePdf className="mr-2 h-4 w-4" />
          )}
          {Object.values(selectedMetrics).filter(Boolean).length} metrics selected
        </div>
        <Button onClick={handleExport}>
          <Download className="mr-2 h-4 w-4" /> Export Data
        </Button>
      </CardFooter>
    </Card>
  )
}
