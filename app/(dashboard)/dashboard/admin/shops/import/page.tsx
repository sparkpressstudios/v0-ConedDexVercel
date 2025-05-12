"use client"

import { useState } from "react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { MapPin, Globe, Upload, Search, Database, Download } from "lucide-react"

export default function ShopImportPage() {
  const [scrapeUrl, setScrapeUrl] = useState("")
  const [csvData, setCsvData] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleScrape = async () => {
    if (!scrapeUrl) {
      toast({
        title: "URL required",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/scrape-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: scrapeUrl }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to scrape shops")
      }

      toast({
        title: "Scraping complete",
        description: `Found ${data.shops?.length || 0} potential shops`,
      })
    } catch (error) {
      console.error("Error scraping shops:", error)
      toast({
        title: "Scraping failed",
        description: error.message || "An error occurred while scraping shops",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCsvImport = async () => {
    if (!csvData.trim()) {
      toast({
        title: "CSV data required",
        description: "Please enter CSV data to import",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/import-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ csvData }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to import shops")
      }

      toast({
        title: "Import complete",
        description: `Imported ${data.imported || 0} shops successfully`,
      })
    } catch (error) {
      console.error("Error importing shops:", error)
      toast({
        title: "Import failed",
        description: error.message || "An error occurred while importing shops",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Shops</h1>
        <p className="text-muted-foreground">Import ice cream shops from various sources</p>
      </div>

      {/* Featured Google Places Import Card */}
      <Card className="border-2 border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center">
            <MapPin className="mr-2 h-5 w-5 text-primary" />
            Google Places Import (Recommended)
          </CardTitle>
          <CardDescription>
            Import ice cream shops directly from Google Places API with intelligent filtering and validation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h3 className="font-medium">Features:</h3>
              <ul className="ml-5 list-disc space-y-1 text-sm">
                <li>Search by location with radius filtering</li>
                <li>Intelligent filtering to identify genuine ice cream shops</li>
                <li>Import shop details, photos, and business hours</li>
                <li>Validate data before importing</li>
                <li>Handle duplicates automatically</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">Benefits:</h3>
              <ul className="ml-5 list-disc space-y-1 text-sm">
                <li>High-quality, verified business data</li>
                <li>Accurate location information</li>
                <li>Rich details including ratings and reviews</li>
                <li>Photos and business hours included</li>
                <li>Bulk import capabilities</li>
              </ul>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex flex-col space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
            <Button asChild className="flex-1">
              <Link href="/dashboard/admin/shops/import/enhanced">
                <Search className="mr-2 h-4 w-4" />
                Search & Import
              </Link>
            </Button>
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/admin/shops/import/advanced">
                <MapPin className="mr-2 h-4 w-4" />
                Advanced Import
              </Link>
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Tabs defaultValue="web-scraping">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="web-scraping">Web Scraping</TabsTrigger>
          <TabsTrigger value="csv-import">CSV Import</TabsTrigger>
          <TabsTrigger value="manual-entry">Manual Entry</TabsTrigger>
        </TabsList>

        <TabsContent value="web-scraping">
          <Card>
            <CardHeader>
              <CardTitle>Web Scraping</CardTitle>
              <CardDescription>Import shops by scraping data from a website</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="scrape-url">Website URL</Label>
                <Input
                  id="scrape-url"
                  placeholder="https://example.com/ice-cream-shops"
                  value={scrapeUrl}
                  onChange={(e) => setScrapeUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Enter the URL of a website that lists ice cream shops. The scraper will attempt to extract shop
                  information.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleScrape} disabled={isLoading || !scrapeUrl}>
                <Globe className="mr-2 h-4 w-4" />
                {isLoading ? "Scraping..." : "Start Scraping"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="csv-import">
          <Card>
            <CardHeader>
              <CardTitle>CSV Import</CardTitle>
              <CardDescription>Import shops from CSV data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="csv-data">CSV Data</Label>
                <Textarea
                  id="csv-data"
                  placeholder="name,address,phone,website,latitude,longitude"
                  value={csvData}
                  onChange={(e) => setCsvData(e.target.value)}
                  rows={10}
                />
                <p className="text-xs text-muted-foreground">
                  Paste CSV data with headers. Required columns: name, address. Optional: phone, website, latitude,
                  longitude, description.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCsvImport} disabled={isLoading || !csvData.trim()}>
                <Upload className="mr-2 h-4 w-4" />
                {isLoading ? "Importing..." : "Import CSV Data"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="manual-entry">
          <Card>
            <CardHeader>
              <CardTitle>Manual Entry</CardTitle>
              <CardDescription>Add shops manually or go to the create shop page</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Database className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Add Shops Manually</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  For adding individual shops with detailed information, use the create shop page.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button asChild>
                <Link href="/dashboard/admin/shops/create">
                  <Database className="mr-2 h-4 w-4" />
                  Create New Shop
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>Bulk Operations</CardTitle>
          <CardDescription>Additional tools for managing shop data</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Download Template</h3>
            <p className="text-sm text-muted-foreground">Download a CSV template for importing shops</p>
            <Button variant="outline" className="mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>
          </div>
          <div className="rounded-lg border p-4">
            <h3 className="mb-2 font-medium">Refresh Existing Shops</h3>
            <p className="text-sm text-muted-foreground">Update all shops with the latest data from Google Places</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/dashboard/admin/shops/import/refresh">
                <MapPin className="mr-2 h-4 w-4" />
                Refresh Shops
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
