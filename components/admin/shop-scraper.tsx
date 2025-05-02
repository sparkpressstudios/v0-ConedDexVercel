"use client"

import { useState } from "react"
import { Search, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function ShopScraper() {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<any[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleScrape = async () => {
    if (!url) {
      toast({
        title: "Error",
        description: "Please enter a URL to scrape",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch("/api/admin/scrape-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to scrape shops")
      }

      const data = await response.json()
      setResults(data.shops)

      toast({
        title: "Success",
        description: `Found ${data.shops.length} shops`,
      })
    } catch (err) {
      console.error("Error scraping shops:", err)
      setError(err instanceof Error ? err.message : "Unknown error occurred")

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to scrape shops",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleImportShops = async () => {
    if (!results || results.length === 0) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/admin/import-shops", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ shops: results }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to import shops")
      }

      const data = await response.json()

      toast({
        title: "Success",
        description: `Imported ${data.imported} shops successfully`,
      })

      // Clear results after successful import
      setResults(null)
    } catch (err) {
      console.error("Error importing shops:", err)

      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to import shops",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Shop Web Scraper</CardTitle>
        <CardDescription>Import ice cream shops by scraping directory websites</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="scrape-url">Website URL</Label>
          <div className="flex gap-2">
            <Input
              id="scrape-url"
              placeholder="https://example.com/ice-cream-directory"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              disabled={isLoading}
            />
            <Button onClick={handleScrape} disabled={isLoading || !url}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Enter the URL of a directory website that lists ice cream shops
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {results && results.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Found {results.length} shops:</h3>
            <div className="max-h-60 overflow-y-auto border rounded-md">
              <table className="w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left text-xs">Name</th>
                    <th className="p-2 text-left text-xs">Address</th>
                    <th className="p-2 text-left text-xs">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((shop, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-2 text-sm">{shop.name || "N/A"}</td>
                      <td className="p-2 text-sm">{shop.address || "N/A"}</td>
                      <td className="p-2 text-sm">{shop.phone || "N/A"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {results && results.length > 0 && (
          <Button onClick={handleImportShops} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              "Import Shops to Database"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
