"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { generateFlavorCatalog } from "@/app/actions/generate-flavor-catalog"
import { toast } from "@/components/ui/use-toast"

export function FlavorCatalogGenerator({ shopId }: { shopId: string }) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [catalogData, setCatalogData] = useState<any>(null)

  const handleGenerateCatalog = async () => {
    setIsGenerating(true)
    try {
      const result = await generateFlavorCatalog(shopId)

      if (result.success) {
        setCatalogData(result.data)
        toast({
          title: "Catalog Generated",
          description: "Flavor catalog has been generated successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to generate catalog",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating catalog:", error)
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
        <CardTitle>Flavor Catalog Generator</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Button onClick={handleGenerateCatalog} disabled={isGenerating}>
            {isGenerating ? "Generating..." : "Generate Catalog"}
          </Button>

          {catalogData && (
            <div className="mt-4 p-4 border rounded-md bg-gray-50">
              <h3 className="text-lg font-medium">Catalog Preview</h3>
              <div className="mt-2">
                <p>
                  <strong>Shop:</strong> {catalogData.shop.name}
                </p>
                <p>
                  <strong>Generated At:</strong> {new Date(catalogData.generatedAt).toLocaleString()}
                </p>
                <p>
                  <strong>Total Flavors:</strong> {catalogData.flavors.length}
                </p>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">Flavors:</h4>
                <ul className="mt-2 space-y-2">
                  {catalogData.flavors.slice(0, 5).map((flavor: any) => (
                    <li key={flavor.id} className="text-sm">
                      <span className="font-medium">{flavor.name}</span>
                      {flavor.special && (
                        <span className="ml-2 text-xs bg-yellow-100 px-2 py-0.5 rounded">Special</span>
                      )}
                    </li>
                  ))}
                  {catalogData.flavors.length > 5 && (
                    <li className="text-sm text-gray-500">And {catalogData.flavors.length - 5} more...</li>
                  )}
                </ul>
              </div>

              <Button
                variant="outline"
                className="mt-4"
                onClick={() => {
                  // Download as JSON
                  const dataStr = JSON.stringify(catalogData, null, 2)
                  const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)

                  const linkElement = document.createElement("a")
                  linkElement.setAttribute("href", dataUri)
                  linkElement.setAttribute("download", `flavor-catalog-${shopId}.json`)
                  linkElement.click()
                }}
              >
                Download Catalog
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
