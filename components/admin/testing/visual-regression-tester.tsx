"use client"

import { useState } from "react"
import { Play, RefreshCw, Check, X, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

interface ComparisonResult {
  diffPercentage: number
  diffImagePath: string | null
  match: boolean
  baselineExists: boolean
}

interface TestResults {
  success: boolean
  results: Record<string, ComparisonResult>
  summary: {
    total: number
    passed: number
    failed: number
    newBaselines: number
  }
}

// Default pages to test
const defaultPages = [
  { name: "home", url: "http://localhost:3000", options: { fullPage: true } },
  { name: "features", url: "http://localhost:3000/features", options: { fullPage: true } },
  { name: "pricing", url: "http://localhost:3000/pricing", options: { fullPage: true } },
  { name: "login", url: "http://localhost:3000/login", options: { fullPage: false } },
  { name: "dashboard", url: "http://localhost:3000/dashboard", options: { fullPage: false } },
  {
    name: "flavors",
    url: "http://localhost:3000/dashboard/flavors",
    options: { fullPage: true, waitForSelector: '[data-testid="flavor-card"]' },
  },
]

export function VisualRegressionTester() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)
  const [updatingBaseline, setUpdatingBaseline] = useState<string | null>(null)
  const { toast } = useToast()

  const runTests = async () => {
    setIsRunning(true)
    try {
      const response = await fetch("/api/testing/visual-regression", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pages: defaultPages }),
      })

      if (!response.ok) {
        throw new Error("Failed to run tests")
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: data.summary.failed > 0 ? "Visual differences detected" : "All visual tests passed",
        description: `${data.summary.passed} of ${data.summary.total} tests passed`,
        variant: data.summary.failed > 0 ? "destructive" : "default",
      })
    } catch (error) {
      console.error("Error running tests:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run tests",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  const updateBaseline = async (name: string) => {
    setUpdatingBaseline(name)
    try {
      const response = await fetch("/api/testing/visual-regression", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        throw new Error("Failed to update baseline")
      }

      // Update local results
      if (results) {
        setResults({
          ...results,
          results: {
            ...results.results,
            [name]: {
              ...results.results[name],
              match: true,
              baselineExists: true,
            },
          },
          summary: {
            ...results.summary,
            passed: results.summary.passed + 1,
            failed: results.summary.failed - 1,
          },
        })
      }

      toast({
        title: "Baseline updated",
        description: `Baseline for ${name} has been updated`,
      })
    } catch (error) {
      console.error("Error updating baseline:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update baseline",
        variant: "destructive",
      })
    } finally {
      setUpdatingBaseline(null)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visual Regression Testing</CardTitle>
        <CardDescription>Compare current UI with baseline screenshots to detect visual changes</CardDescription>
      </CardHeader>
      <CardContent>
        {results ? (
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Test Details</TabsTrigger>
              <TabsTrigger value="images">Comparison Images</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <div className="space-y-4">
                <Alert variant={results.summary.failed > 0 ? "destructive" : "default"}>
                  <div className="flex items-center gap-2">
                    {results.summary.failed === 0 ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <X className="h-5 w-5 text-red-500" />
                    )}
                    <AlertTitle>
                      {results.summary.failed === 0 ? "All Tests Passed" : "Visual Differences Detected"}
                    </AlertTitle>
                  </div>
                  <AlertDescription className="mt-2">
                    {results.summary.passed} of {results.summary.total} tests passed.
                    {results.summary.newBaselines > 0 &&
                      ` Created ${results.summary.newBaselines} new baseline${
                        results.summary.newBaselines > 1 ? "s" : ""
                      }.`}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-muted/50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg">Total Tests</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-3xl font-bold">{results.summary.total}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-green-700">Passed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-3xl font-bold text-green-700">{results.summary.passed}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-red-50">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-lg text-red-700">Failed</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <p className="text-3xl font-bold text-red-700">{results.summary.failed}</p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                {Object.entries(results.results).map(([name, result]) => (
                  <Card key={name} className={result.match ? "border-green-200" : "border-red-200"}>
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <div>
                        <CardTitle className="text-base capitalize">{name.replace(/-/g, " ")}</CardTitle>
                        <CardDescription>Difference: {(result.diffPercentage * 100).toFixed(2)}%</CardDescription>
                      </div>
                      <Badge variant={result.match ? "default" : "destructive"}>
                        {result.match ? "Passed" : "Failed"}
                      </Badge>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      {!result.baselineExists && (
                        <Alert className="mb-2">
                          <AlertTitle>New Baseline Created</AlertTitle>
                          <AlertDescription>
                            This is the first time this page has been tested. The current screenshot has been saved as
                            the baseline.
                          </AlertDescription>
                        </Alert>
                      )}
                      {!result.match && (
                        <Button size="sm" onClick={() => updateBaseline(name)} disabled={updatingBaseline === name}>
                          {updatingBaseline === name ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Updating...
                            </>
                          ) : (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Update Baseline
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="images">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(results.results).map(([name, result]) => (
                  <div key={name} className="space-y-2">
                    <h3 className="font-medium capitalize">{name.replace(/-/g, " ")}</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <Card className="overflow-hidden">
                        <CardHeader className="p-2">
                          <CardTitle className="text-xs">Baseline</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-muted">
                            <ImageIcon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                            <img
                              src={`/visual-testing/baseline/${name}.png`}
                              alt={`Baseline for ${name}`}
                              className="w-full h-auto"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="overflow-hidden">
                        <CardHeader className="p-2">
                          <CardTitle className="text-xs">Current</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-muted">
                            <ImageIcon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                            <img
                              src={`/visual-testing/current/${name}.png`}
                              alt={`Current for ${name}`}
                              className="w-full h-auto"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                      <Card className="overflow-hidden">
                        <CardHeader className="p-2">
                          <CardTitle className="text-xs">Diff</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                          <div className="relative aspect-video bg-muted">
                            <ImageIcon className="absolute inset-0 m-auto h-6 w-6 text-muted-foreground" />
                            <img
                              src={`/visual-testing/diff/${name}.png`}
                              alt={`Diff for ${name}`}
                              className="w-full h-auto"
                              onError={(e) => {
                                e.currentTarget.style.display = "none"
                              }}
                            />
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ImageIcon className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No visual test results yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Run the visual regression tests to compare the current UI with baseline screenshots and detect visual
              changes.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Visual Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Visual Tests
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
