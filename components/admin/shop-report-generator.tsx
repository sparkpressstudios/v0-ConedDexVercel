"use client"

import { useState } from "react"
import { FileText, Download, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { generateShopReport } from "@/app/actions/generate-shop-report"
import { useToast } from "@/hooks/use-toast"

interface ShopReportGeneratorProps {
  shopId: string
  shopName: string
}

export function ShopReportGenerator({ shopId, shopName }: ShopReportGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportUrl, setReportUrl] = useState<string | null>(null)
  const { toast } = useToast()

  const handleGenerateReport = async () => {
    setIsGenerating(true)
    try {
      const result = await generateShopReport(shopId)

      if (result.success && result.url) {
        setReportUrl(result.url)
        toast({
          title: "Report Generated",
          description: "Your shop report has been generated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to generate report")
      }
    } catch (error) {
      console.error("Error generating report:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate report",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Shop Report
        </CardTitle>
        <CardDescription>Generate a comprehensive PDF report for {shopName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          The report includes shop details, flavor listings, and performance metrics. Perfect for sharing with team
          members or for your records.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGenerateReport} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Report
            </>
          )}
        </Button>

        {reportUrl && (
          <Button asChild>
            <a href={reportUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
