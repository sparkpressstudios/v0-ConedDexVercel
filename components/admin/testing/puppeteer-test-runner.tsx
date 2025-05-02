"use client"

import { useState } from "react"
import { Play, CheckCircle, XCircle, Loader2, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

interface TestResult {
  success: boolean
  message: string
}

interface TestResults {
  allPassed: boolean
  results: {
    homePage: TestResult
    loginFlow: TestResult
    flavorBrowsing: TestResult
    responsiveness: TestResult
  }
}

export function PuppeteerTestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<TestResults | null>(null)
  const { toast } = useToast()

  const runTests = async () => {
    setIsRunning(true)
    try {
      // In a real implementation, this would call an API endpoint
      // that triggers the Puppeteer tests on the server
      const response = await fetch("/api/testing/run-ui-tests", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to run tests")
      }

      const data = await response.json()
      setResults(data)

      toast({
        title: data.allPassed ? "All tests passed!" : "Some tests failed",
        description: `${Object.values(data.results).filter((r: any) => r.success).length} of ${Object.values(data.results).length} tests passed`,
        variant: data.allPassed ? "default" : "destructive",
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>UI Automated Testing</CardTitle>
        <CardDescription>
          Run automated UI tests using Puppeteer to verify the functionality of the ConeDex platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        {results ? (
          <Tabs defaultValue="summary">
            <TabsList className="mb-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="details">Test Details</TabsTrigger>
              <TabsTrigger value="screenshots">Screenshots</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Alert variant={results.allPassed ? "default" : "destructive"}>
                <div className="flex items-center gap-2">
                  {results.allPassed ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  <AlertTitle>{results.allPassed ? "All Tests Passed" : "Some Tests Failed"}</AlertTitle>
                </div>
                <AlertDescription className="mt-2">
                  {Object.values(results.results).filter((r) => r.success).length} of{" "}
                  {Object.values(results.results).length} tests passed successfully.
                </AlertDescription>
              </Alert>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                {Object.entries(results.results).map(([testName, result]) => (
                  <div key={testName} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium capitalize">{testName.replace(/([A-Z])/g, " $1").trim()}</h3>
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="screenshots">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  "home-page",
                  "login-form-filled",
                  "after-login",
                  "flavor-details",
                  "responsive-mobile",
                  "responsive-tablet",
                  "responsive-desktop",
                ].map((screenshot) => (
                  <Card key={screenshot} className="overflow-hidden">
                    <CardHeader className="p-3">
                      <CardTitle className="text-sm capitalize">{screenshot.replace(/-/g, " ")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="relative aspect-video bg-muted">
                        <ImageIcon className="absolute inset-0 m-auto h-8 w-8 text-muted-foreground" />
                        <img
                          src={`/test-results/${screenshot}.png`}
                          alt={`Screenshot of ${screenshot}`}
                          className="w-full h-auto"
                          onError={(e) => {
                            e.currentTarget.style.display = "none"
                          }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Play className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No test results yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Run the automated UI tests to see the results here. Tests will check core functionality across different
              screen sizes.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run UI Tests
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
