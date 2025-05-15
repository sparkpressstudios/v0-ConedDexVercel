import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Thermometer, Droplets, Zap, Flame, Leaf, AlertTriangle } from "lucide-react"

interface FlavorDetailViewProps {
  flavor: any
}

export function FlavorDetailView({ flavor }: FlavorDetailViewProps) {
  // Extract flavor characteristics
  const characteristics = {
    sweetness: Math.floor(Math.random() * 40) + 60, // 60-100 for demo
    creaminess: Math.floor(Math.random() * 40) + 60,
    richness: Math.floor(Math.random() * 40) + 60,
    intensity: Math.floor(Math.random() * 40) + 60,
  }

  // Extract potential allergens
  const allergens = []
  const flavorName = flavor.name.toLowerCase()
  const flavorDesc = (flavor.description || "").toLowerCase()
  const combinedText = `${flavorName} ${flavorDesc}`

  if (combinedText.includes("nut") || combinedText.includes("almond") || combinedText.includes("pecan")) {
    allergens.push("nuts")
  }

  if (combinedText.includes("milk") || combinedText.includes("cream") || combinedText.includes("dairy")) {
    allergens.push("dairy")
  }

  if (combinedText.includes("egg")) {
    allergens.push("eggs")
  }

  if (combinedText.includes("soy")) {
    allergens.push("soy")
  }

  if (combinedText.includes("wheat") || combinedText.includes("gluten")) {
    allergens.push("gluten")
  }

  // Determine dietary info
  const dietaryInfo = []

  if (combinedText.includes("vegan")) {
    dietaryInfo.push("vegan")
  } else if (!combinedText.includes("milk") && !combinedText.includes("cream") && !combinedText.includes("dairy")) {
    dietaryInfo.push("dairy-free")
  }

  if (combinedText.includes("gluten-free") || combinedText.includes("gluten free")) {
    dietaryInfo.push("gluten-free")
  }

  if (combinedText.includes("sugar-free") || combinedText.includes("sugar free")) {
    dietaryInfo.push("sugar-free")
  }

  if (combinedText.includes("organic")) {
    dietaryInfo.push("organic")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Flavor Profile</CardTitle>
          <CardDescription>Detailed characteristics of this flavor</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4 text-red-500" />
                <span className="text-sm font-medium">Sweetness</span>
              </div>
              <span className="text-sm text-muted-foreground">{characteristics.sweetness}%</span>
            </div>
            <Progress value={characteristics.sweetness} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Creaminess</span>
              </div>
              <span className="text-sm text-muted-foreground">{characteristics.creaminess}%</span>
            </div>
            <Progress value={characteristics.creaminess} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Richness</span>
              </div>
              <span className="text-sm text-muted-foreground">{characteristics.richness}%</span>
            </div>
            <Progress value={characteristics.richness} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                <span className="text-sm font-medium">Flavor Intensity</span>
              </div>
              <span className="text-sm text-muted-foreground">{characteristics.intensity}%</span>
            </div>
            <Progress value={characteristics.intensity} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {allergens.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Allergen Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {allergens.map((allergen) => (
                  <Badge key={allergen} variant="outline" className="bg-amber-50">
                    {allergen}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {dietaryInfo.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Leaf className="h-4 w-4 text-green-500" />
                Dietary Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {dietaryInfo.map((info) => (
                  <Badge key={info} variant="outline" className="bg-green-50">
                    {info}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
