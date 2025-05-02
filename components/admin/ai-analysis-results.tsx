"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CheckCircle, RefreshCw } from "lucide-react"
import { analyzeFlavorWithAI } from "@/app/actions/flavor-moderation"

interface AIAnalysisResultsProps {
  flavorId: string
  initialAnalysis?: {
    categories?: string[]
    rarity?: string
    duplicateScore?: number
    moderationFlags?: Record<string, boolean>
    similarFlavors?: Array<{ id: string; name: string; similarity: number }>
  }
}

export function AIAnalysisResults({ flavorId, initialAnalysis }: AIAnalysisResultsProps) {
  const [analysis, setAnalysis] = useState(initialAnalysis)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshAnalysis = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await analyzeFlavorWithAI(flavorId)
      setAnalysis(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze flavor")
    } finally {
      setIsLoading(false)
    }
  }

  const hasModerationFlags = analysis?.moderationFlags && Object.values(analysis.moderationFlags).some((flag) => flag)

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          AI Analysis Results
          <Button variant="outline" size="sm" onClick={refreshAnalysis} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            {isLoading ? "Analyzing..." : "Refresh Analysis"}
          </Button>
        </CardTitle>
        <CardDescription>OpenAI-powered analysis of this flavor submission</CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="bg-destructive/10 p-3 rounded-md mb-4 text-destructive flex items-center">
            <AlertCircle className="h-5 w-5 mr-2" />
            {error}
          </div>
        )}

        {!analysis && !isLoading && !error && (
          <div className="text-center py-6 text-muted-foreground">
            No analysis available. Click "Refresh Analysis" to analyze this flavor.
          </div>
        )}

        {analysis && (
          <Tabs defaultValue="categories">
            <TabsList className="grid grid-cols-4 mb-4">
              <TabsTrigger value="categories">Categories</TabsTrigger>
              <TabsTrigger value="duplicates">Duplicates</TabsTrigger>
              <TabsTrigger value="moderation">
                Moderation
                {hasModerationFlags && (
                  <Badge variant="destructive" className="ml-2">
                    !
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="rarity">Rarity</TabsTrigger>
            </TabsList>

            <TabsContent value="categories" className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {analysis.categories?.map((category, i) => (
                  <Badge key={i} variant="secondary">
                    {category}
                  </Badge>
                )) || "No categories assigned"}
              </div>
            </TabsContent>

            <TabsContent value="duplicates">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Duplicate Score:</span>
                  <Badge variant={analysis.duplicateScore && analysis.duplicateScore > 0.8 ? "destructive" : "outline"}>
                    {analysis.duplicateScore ? `${(analysis.duplicateScore * 100).toFixed(1)}%` : "N/A"}
                  </Badge>
                </div>

                {analysis.similarFlavors && analysis.similarFlavors.length > 0 ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Similar Flavors:</h4>
                    <ul className="space-y-2">
                      {analysis.similarFlavors.map((flavor, i) => (
                        <li key={i} className="flex items-center justify-between text-sm border-b pb-1">
                          <span>{flavor.name}</span>
                          <Badge variant={flavor.similarity > 0.9 ? "destructive" : "outline"}>
                            {(flavor.similarity * 100).toFixed(1)}% match
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No similar flavors found</p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="moderation">
              {analysis.moderationFlags ? (
                <div className="space-y-2">
                  {Object.entries(analysis.moderationFlags).map(([flag, value], i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="capitalize">{flag.replace("_", " ")}</span>
                      {value ? (
                        <Badge variant="destructive">Flagged</Badge>
                      ) : (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No moderation flags available</p>
              )}
            </TabsContent>

            <TabsContent value="rarity">
              <div className="flex items-center justify-between">
                <span>Rarity Classification:</span>
                <Badge variant="secondary" className="text-lg px-3 py-1">
                  {analysis.rarity || "Not classified"}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Rarity is determined by analyzing uniqueness, ingredient combinations, and similarity to existing
                flavors.
              </p>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">Powered by OpenAI GPT-4 analysis</CardFooter>
    </Card>
  )
}
