"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateShopReport } from "@/app/actions/generate-shop-report"
import { toast } from "@/components/ui/use-toast"

export function ShopReportGenerator({ shopId }: { shopId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportData, setReportData] = useState<any>(null)

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const result = await generateShopReport(shopId)

      if (result.success) {
        setReportData(result.data)
        toast({
          title: "Report Generated",
          description: "Shop report has been generated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate report",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shop Report Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleGenerateReport} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Report"}
          </Button>

          {reportData && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium">Report Preview</h3>
              <div className="mt-2">
                <p>
                  <strong>Shop:</strong> {reportData.shop.name}
                </p>
                <p>
                  <strong>Generated At:</strong> {new Date(reportData.generatedAt).toLocaleString()}
                </p>
                <p>
                  <strong>Total Flavors:</strong> {reportData.summary.totalFlavors}
                </p>
                <p>
                  <strong>Total Reviews:</strong> {reportData.summary.totalReviews}
                </p>
                <p>
                  <strong>Average Rating:</strong> {reportData.summary.averageRating.toFixed(1)}/5
                </p>
              </div>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => {
                  // Download as JSON
                  const dataStr = JSON.stringify(reportData, null, 2)
                  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

                  const linkElement = document.createElement("a")
                  linkElement.setAttribute("href", dataUri)
                  linkElement.setAttribute("download", `shop-report-${shopId}.json`)
                  linkElement.click()
                }}
              >
                Download Report
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
