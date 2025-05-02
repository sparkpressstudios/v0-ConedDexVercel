"use client"

import { useState } from "react"
import { Download, Loader2, BarChart3, LineChart, PieChart, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useToast } from "@/hooks/use-toast"

// Sample chart data
const sampleCharts = {
  bar: {
    type: "bar",
    data: {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Sales",
          data: [12, 19, 3, 5, 2, 3],
          backgroundColor: "rgba(59, 130, 246, 0.5)",
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Sales",
        },
      },
    },
  },
  line: {
    type: "line",
    data: {
      labels: ["January", "February", "March", "April", "May", "June"],
      datasets: [
        {
          label: "Visitors",
          data: [65, 59, 80, 81, 56, 55],
          fill: false,
          borderColor: "rgb(75, 192, 192)",
          tension: 0.1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Monthly Visitors",
        },
      },
    },
  },
  pie: {
    type: "pie",
    data: {
      labels: ["Chocolate", "Vanilla", "Strawberry", "Mint", "Cookie Dough"],
      datasets: [
        {
          label: "Popularity",
          data: [35, 25, 20, 10, 10],
          backgroundColor: [
            "rgba(255, 99, 132, 0.5)",
            "rgba(54, 162, 235, 0.5)",
            "rgba(255, 206, 86, 0.5)",
            "rgba(75, 192, 192, 0.5)",
            "rgba(153, 102, 255, 0.5)",
          ],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Flavor Popularity",
        },
      },
    },
  },
}

export function ChartExportTool() {
  const [activeChart, setActiveChart] = useState("bar")
  const [isExporting, setIsExporting] = useState(false)
  const [exportedUrls, setExportedUrls] = useState<string[]>([])
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState({
    width: 800,
    height: 500,
    backgroundColor: "#ffffff",
    transparent: false,
    quality: 90,
  })
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const response = await fetch("/api/charts/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          charts: [
            {
              data: sampleCharts[activeChart as keyof typeof sampleCharts],
              options: {
                width: options.width,
                height: options.height,
                backgroundColor: options.transparent ? "transparent" : options.backgroundColor,
                quality: options.quality,
              },
            },
          ],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to export chart")
      }

      const data = await response.json()
      setExportedUrls(data.urls)

      toast({
        title: "Chart Exported",
        description: "Your chart has been exported successfully.",
      })
    } catch (error) {
      console.error("Error exporting chart:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export chart",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleOptionChange = (key: keyof typeof options, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const getChartIcon = (type: string) => {
    switch (type) {
      case "bar":
        return <BarChart3 className="h-4 w-4" />
      case "line":
        return <LineChart className="h-4 w-4" />
      case "pie":
        return <PieChart className="h-4 w-4" />
      default:
        return <BarChart3 className="h-4 w-4" />
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Chart Export Tool
        </CardTitle>
        <CardDescription>Export analytics charts as images for reports and presentations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeChart} onValueChange={setActiveChart}>
          <TabsList className="mb-4">
            <TabsTrigger value="bar" className="flex items-center gap-1">
              <BarChart3 className="h-4 w-4" /> Bar Chart
            </TabsTrigger>
            <TabsTrigger value="line" className="flex items-center gap-1">
              <LineChart className="h-4 w-4" /> Line Chart
            </TabsTrigger>
            <TabsTrigger value="pie" className="flex items-center gap-1">
              <PieChart className="h-4 w-4" /> Pie Chart
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bar">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <img
                src={exportedUrls[0] || "/placeholder.svg?height=400&width=800&query=bar+chart"}
                alt="Bar Chart"
                className="max-w-full max-h-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="line">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <img
                src={exportedUrls[0] || "/placeholder.svg?height=400&width=800&query=line+chart"}
                alt="Line Chart"
                className="max-w-full max-h-full"
              />
            </div>
          </TabsContent>

          <TabsContent value="pie">
            <div className="aspect-video bg-muted rounded-md flex items-center justify-center">
              <img
                src={exportedUrls[0] || "/placeholder.svg?height=400&width=800&query=pie+chart"}
                alt="Pie Chart"
                className="max-w-full max-h-full"
              />
            </div>
          </TabsContent>
        </Tabs>

        <Collapsible open={showOptions} onOpenChange={setShowOptions} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Export Options</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                {showOptions ? "Hide Options" : "Show Options"}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="width">Width (px)</Label>
                <Input
                  id="width"
                  type="number"
                  value={options.width}
                  onChange={(e) => handleOptionChange("width", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="height">Height (px)</Label>
                <Input
                  id="height"
                  type="number"
                  value={options.height}
                  onChange={(e) => handleOptionChange("height", Number.parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="transparent">Transparent Background</Label>
                <Switch
                  id="transparent"
                  checked={options.transparent}
                  onCheckedChange={(checked) => handleOptionChange("transparent", checked)}
                />
              </div>
            </div>

            {!options.transparent && (
              <div className="space-y-2">
                <Label htmlFor="backgroundColor">Background Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="backgroundColor"
                    value={options.backgroundColor}
                    onChange={(e) => handleOptionChange("backgroundColor", e.target.value)}
                  />
                  <input
                    type="color"
                    value={options.backgroundColor}
                    onChange={(e) => handleOptionChange("backgroundColor", e.target.value)}
                    className="w-10 h-10 p-1 rounded-md"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="quality">Image Quality: {options.quality}%</Label>
              <Slider
                id="quality"
                min={10}
                max={100}
                step={5}
                value={[options.quality]}
                onValueChange={(value) => handleOptionChange("quality", value[0])}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {exportedUrls.length > 0 && (
          <div className="space-y-2">
            <Label>Exported Chart</Label>
            <div className="flex items-center gap-2">
              <Input value={`${window.location.origin}${exportedUrls[0]}`} readOnly />
              <Button asChild size="icon">
                <a href={exportedUrls[0]} download target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleExport} disabled={isExporting} className="w-full">
          {isExporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export {activeChart.charAt(0).toUpperCase() + activeChart.slice(1)} Chart
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
