"use client"

import { useState } from "react"
import { FileText, Download, Loader2, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { generateFlavorCatalog } from "@/app/actions/generate-flavor-catalog"
import { useToast } from "@/hooks/use-toast"

interface FlavorCatalogGeneratorProps {
  shopId: string
  shopName: string
}

export function FlavorCatalogGenerator({ shopId, shopName }: FlavorCatalogGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [catalogUrl, setCatalogUrl] = useState<string | null>(null)
  const [showOptions, setShowOptions] = useState(false)
  const [options, setOptions] = useState({
    includeImages: true,
    includeDescriptions: true,
    includePricing: false,
    customTitle: "",
    customFooter: "",
  })
  const { toast } = useToast()

  const handleGenerateCatalog = async () => {
    setIsGenerating(true)
    try {
      const result = await generateFlavorCatalog({
        shopId,
        ...options,
      })

      if (result.success && result.url) {
        setCatalogUrl(result.url)
        toast({
          title: "Catalog Generated",
          description: "Your flavor catalog has been generated successfully.",
        })
      } else {
        throw new Error(result.error || "Failed to generate catalog")
      }
    } catch (error) {
      console.error("Error generating catalog:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate catalog",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleOptionChange = (key: keyof typeof options, value: any) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Flavor Catalog
        </CardTitle>
        <CardDescription>Generate a professional PDF catalog of your flavors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Create a beautifully formatted catalog of all flavors offered by {shopName}. Perfect for sharing with
          customers or printing for your shop.
        </p>

        <Collapsible open={showOptions} onOpenChange={setShowOptions} className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Catalog Options</h4>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <Settings2 className="h-4 w-4 mr-2" />
                {showOptions ? "Hide Options" : "Show Options"}
              </Button>
            </CollapsibleTrigger>
          </div>
          <CollapsibleContent className="space-y-4">
            <Separator />
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeImages"
                  checked={options.includeImages}
                  onCheckedChange={(checked) => handleOptionChange("includeImages", checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="includeImages">Include Images</Label>
                  <p className="text-sm text-muted-foreground">Show flavor images in the catalog</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includeDescriptions"
                  checked={options.includeDescriptions}
                  onCheckedChange={(checked) => handleOptionChange("includeDescriptions", checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="includeDescriptions">Include Descriptions</Label>
                  <p className="text-sm text-muted-foreground">Show flavor descriptions in the catalog</p>
                </div>
              </div>

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="includePricing"
                  checked={options.includePricing}
                  onCheckedChange={(checked) => handleOptionChange("includePricing", checked)}
                />
                <div className="grid gap-1.5 leading-none">
                  <Label htmlFor="includePricing">Include Pricing</Label>
                  <p className="text-sm text-muted-foreground">Show flavor prices in the catalog</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="customTitle">Custom Title (Optional)</Label>
                <Input
                  id="customTitle"
                  placeholder={`Flavor Catalog: ${shopName}`}
                  value={options.customTitle}
                  onChange={(e) => handleOptionChange("customTitle", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="customFooter">Custom Footer (Optional)</Label>
                <Input
                  id="customFooter"
                  placeholder={`Generated by ConeDex | ${shopName} Flavor Catalog`}
                  value={options.customFooter}
                  onChange={(e) => handleOptionChange("customFooter", e.target.value)}
                />
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleGenerateCatalog} disabled={isGenerating}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <FileText className="mr-2 h-4 w-4" />
              Generate Catalog
            </>
          )}
        </Button>

        {catalogUrl && (
          <Button asChild>
            <a href={catalogUrl} download target="_blank" rel="noopener noreferrer">
              <Download className="mr-2 h-4 w-4" />
              Download Catalog
            </a>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
