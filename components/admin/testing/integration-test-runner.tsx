"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, XCircle, Play, Loader2 } from "lucide-react"
import {
  testSignupToFlavorLoggingFlow,
  testShopClaimingProcess,
  testOfflineFunctionality,
  testNotificationSystem,
  runAllIntegrationTests,
} from "@/lib/testing/integration-tests"

export function IntegrationTestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [activeTab, setActiveTab] = useState("all")
  const [results, setResults] = useState<Record<string, { success: boolean; message: string }>>({})

  const runTest = async (testName: string, testFn: () => Promise<{ success: boolean; message: string }>) => {
    setIsRunning(true)
    setResults((prev) => ({ ...prev, [testName]: { success: false, message: "Running..." } }))

    try {
      const result = await testFn()
      setResults((prev) => ({ ...prev, [testName]: result }))
    } catch (error) {
      setResults((prev) => ({
        ...prev,
        [testName]: {
          success: false,
          message: error instanceof Error ? error.message : "Test failed with unknown error",
        },
      }))
    } finally {
      setIsRunning(false)
    }
  }

  const runAll = async () => {
    setIsRunning(true)
    setResults({
      signupToFlavorLogging: { success: false, message: "Running..." },
      shopClaiming: { success: false, message: "Running..." },
      offlineFunctionality: { success: false, message: "Running..." },
      notificationSystem: { success: false, message: "Running..." },
    })

    try {
      const allResults = await runAllIntegrationTests()
      setResults(allResults.results)
    } catch (error) {
      console.error("Error running all tests:", error)
    } finally {
      setIsRunning(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Integration Tests</CardTitle>
        <CardDescription>Run tests to verify key user journeys and feature integrations</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Tests</TabsTrigger>
            <TabsTrigger value="signup">Signup Flow</TabsTrigger>
            <TabsTrigger value="shop">Shop Claiming</TabsTrigger>
            <TabsTrigger value="offline">Offline Mode</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">All Integration Tests</h3>
                <Button onClick={runAll} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run All Tests
                    </>
                  )}
                </Button>
              </div>

              <div className="space-y-2">
                <TestResultItem name="Signup to Flavor Logging" result={results.signupToFlavorLogging} />
                <TestResultItem name="Shop Claiming Process" result={results.shopClaiming} />
                <TestResultItem name="Offline Functionality" result={results.offlineFunctionality} />
                <TestResultItem name="Notification System" result={results.notificationSystem} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Signup to Flavor Logging Flow</h3>
                <Button
                  onClick={() => runTest("signupToFlavorLogging", testSignupToFlavorLoggingFlow)}
                  disabled={isRunning}
                >
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              <TestResultItem name="Signup to Flavor Logging" result={results.signupToFlavorLogging} showDetails />
            </div>
          </TabsContent>

          <TabsContent value="shop">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Shop Claiming Process</h3>
                <Button onClick={() => runTest("shopClaiming", testShopClaimingProcess)} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              <TestResultItem name="Shop Claiming Process" result={results.shopClaiming} showDetails />
            </div>
          </TabsContent>

          <TabsContent value="offline">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Offline Functionality</h3>
                <Button onClick={() => runTest("offlineFunctionality", testOfflineFunctionality)} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              <TestResultItem name="Offline Functionality" result={results.offlineFunctionality} showDetails />
            </div>
          </TabsContent>

          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Notification System</h3>
                <Button onClick={() => runTest("notificationSystem", testNotificationSystem)} disabled={isRunning}>
                  {isRunning ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running...
                    </>
                  ) : (
                    <>
                      <Play className="mr-2 h-4 w-4" />
                      Run Test
                    </>
                  )}
                </Button>
              </div>

              <TestResultItem name="Notification System" result={results.notificationSystem} showDetails />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <p className="text-sm text-muted-foreground">
          These tests verify that key features of the platform work together correctly. Run them after making
          significant changes to ensure everything still works.
        </p>
      </CardFooter>
    </Card>
  )
}

interface TestResultItemProps {
  name: string
  result?: { success: boolean; message: string }
  showDetails?: boolean
}

function TestResultItem({ name, result, showDetails = false }: TestResultItemProps) {
  if (!result) {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center">
          <div className="h-2 w-2 rounded-full bg-muted-foreground mr-3"></div>
          <span>{name}</span>
        </div>
        <Badge variant="outline">Not Run</Badge>
      </div>
    )
  }

  if (result.message === "Running...") {
    return (
      <div className="flex items-center justify-between p-3 border rounded-md">
        <div className="flex items-center">
          <Loader2 className="h-4 w-4 mr-3 animate-spin text-muted-foreground" />
          <span>{name}</span>
        </div>
        <Badge variant="outline">Running</Badge>
      </div>
    )
  }

  return (
    <div className="p-3 border rounded-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {result.success ? (
            <CheckCircle2 className="h-4 w-4 mr-3 text-green-500" />
          ) : (
            <XCircle className="h-4 w-4 mr-3 text-red-500" />
          )}
          <span>{name}</span>
        </div>
        <Badge variant={result.success ? "success" : "destructive"}>{result.success ? "Passed" : "Failed"}</Badge>
      </div>

      {showDetails && <div className="mt-2 text-sm text-muted-foreground">{result.message}</div>}
    </div>
  )
}
