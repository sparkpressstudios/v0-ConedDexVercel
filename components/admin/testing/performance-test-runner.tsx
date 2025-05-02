"use client"

import { useState } from "react"
import { Play, Loader2, BarChart3, Clock, FileCode, HardDrive } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

interface PerformanceMetrics {
  url: string
  loadTime: number
  firstPaint: number
  firstContentfulPaint: number
  domContentLoaded: number
  largestContentfulPaint?: number
  totalBlockingTime?: number
  cumulativeLayoutShift?: number
  speedIndex?: number
  resourceCount: number
  resourceSize: number
  jsHeapSize: number
}

// Default pages to test
const defaultUrls = [
  "http://localhost:3000",
  "http://localhost:3000/features",
  "http://localhost:3000/pricing",
  "http://localhost:3000/login",
  "http://localhost:3000/dashboard",
  "http://localhost:3000/dashboard/flavors",
]

export function PerformanceTestRunner() {
  const [isRunning, setIsRunning] = useState(false)
  const [results, setResults] = useState<Record<string, PerformanceMetrics> | null>(null)
  const [currentUrl, setCurrentUrl] = useState<string | null>(null)
  const [progress, setProgress] = useState(0)
  const { toast } = useToast()

  const runTests = async () => {
    setIsRunning(true)
    setResults(null)
    setProgress(0)

    try {
      const totalUrls = defaultUrls.length
      let completedUrls = 0

      // Process URLs one by one to show progress
      const allResults: Record<string, PerformanceMetrics> = {}

      for (const url of defaultUrls) {
        setCurrentUrl(url)

        const response = await fetch("/api/testing/performance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ urls: [url] }),
        })

        if (!response.ok) {
          throw new Error(`Failed to test ${url}`)
        }

        const data = await response.json()

        if (data.success && data.results[url]) {
          allResults[url] = data.results[url]
        }

        completedUrls++
        setProgress((completedUrls / totalUrls) * 100)
      }

      setResults(allResults)
      setCurrentUrl(null)

      toast({
        title: "Performance tests completed",
        description: `Tested ${Object.keys(allResults).length} pages successfully`,
      })
    } catch (error) {
      console.error("Error running performance tests:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to run performance tests",
        variant: "destructive",
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Format bytes to human-readable format
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Format milliseconds to human-readable format
  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`
    return `${(ms / 1000).toFixed(2)}s`
  }

  // Get performance score (simplified)
  const getPerformanceScore = (metrics: PerformanceMetrics): number => {
    // This is a simplified scoring algorithm
    // In a real implementation, you would use more sophisticated weighting
    const loadTimeScore = Math.max(0, 100 - metrics.loadTime / 100)
    const fcpScore = Math.max(0, 100 - metrics.firstContentfulPaint / 20)
    const resourceScore = Math.max(0, 100 - metrics.resourceCount / 2)

    return Math.round((loadTimeScore + fcpScore + resourceScore) / 3)
  }

  // Get score color
  const getScoreColor = (score: number): string => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Performance Testing</CardTitle>
        <CardDescription>Measure loading times and performance metrics across the platform</CardDescription>
      </CardHeader>
      <CardContent>
        {isRunning ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Testing {currentUrl}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertTitle>Running Performance Tests</AlertTitle>
              <AlertDescription>
                This may take a few minutes. We're measuring load times, resource usage, and other metrics.
              </AlertDescription>
            </Alert>
          </div>
        ) : results ? (
          <Tabs defaultValue="overview">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="details">Detailed Metrics</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="space-y-4">
                {Object.entries(results).map(([url, metrics]) => {
                  const score = getPerformanceScore(metrics)
                  const scoreColorClass = getScoreColor(score)

                  return (
                    <Card key={url} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{url.replace("http://localhost:3000", "")}</CardTitle>
                          <div className={`text-2xl font-bold ${scoreColorClass}`}>{score}</div>
                        </div>
                        <CardDescription>{new URL(url).pathname || "Home Page"}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-4 pt-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> Load Time
                            </span>
                            <span className="font-medium">{formatTime(metrics.loadTime)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Clock className="h-3 w-3 mr-1" /> First Paint
                            </span>
                            <span className="font-medium">{formatTime(metrics.firstPaint)}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <FileCode className="h-3 w-3 mr-1" /> Resources
                            </span>
                            <span className="font-medium">{metrics.resourceCount}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground flex items-center">
                              <HardDrive className="h-3 w-3 mr-1" /> Size
                            </span>
                            <span className="font-medium">{formatBytes(metrics.resourceSize)}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                {Object.entries(results).map(([url, metrics]) => (
                  <Card key={url} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{url.replace("http://localhost:3000", "")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Load Time</span>
                          <span className="font-medium">{formatTime(metrics.loadTime)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">DOM Content Loaded</span>
                          <span className="font-medium">{formatTime(metrics.domContentLoaded)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">First Paint</span>
                          <span className="font-medium">{formatTime(metrics.firstPaint)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">First Contentful Paint</span>
                          <span className="font-medium">{formatTime(metrics.firstContentfulPaint)}</span>
                        </div>
                        {metrics.largestContentfulPaint && (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Largest Contentful Paint</span>
                            <span className="font-medium">{formatTime(metrics.largestContentfulPaint)}</span>
                          </div>
                        )}
                        {metrics.totalBlockingTime && (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Total Blocking Time</span>
                            <span className="font-medium">{formatTime(metrics.totalBlockingTime)}</span>
                          </div>
                        )}
                        {metrics.cumulativeLayoutShift !== undefined && (
                          <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground">Cumulative Layout Shift</span>
                            <span className="font-medium">{metrics.cumulativeLayoutShift.toFixed(3)}</span>
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">JS Heap Size</span>
                          <span className="font-medium">{formatBytes(metrics.jsHeapSize)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="resources">
              <div className="space-y-4">
                {Object.entries(results).map(([url, metrics]) => (
                  <Card key={url} className="overflow-hidden">
                    <CardHeader className="p-4 pb-2">
                      <CardTitle className="text-base">{url.replace("http://localhost:3000", "")}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Resource Count</span>
                          <span className="font-medium">{metrics.resourceCount}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Total Resource Size</span>
                          <span className="font-medium">{formatBytes(metrics.resourceSize)}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">Average Resource Size</span>
                          <span className="font-medium">
                            {formatBytes(metrics.resourceCount ? metrics.resourceSize / metrics.resourceCount : 0)}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">JS Heap Size</span>
                          <span className="font-medium">{formatBytes(metrics.jsHeapSize)}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No performance test results yet</h3>
            <p className="text-muted-foreground max-w-md mt-1">
              Run the performance tests to measure loading times, resource usage, and other metrics across the platform.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={runTests} disabled={isRunning} className="w-full">
          {isRunning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running Performance Tests...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Run Performance Tests
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
