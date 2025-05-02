"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Loader2, Upload, Download, FileText, Play, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export function BatchProcessor() {
  const [activeTab, setActiveTab] = useState("import")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [results, setResults] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [options, setOptions] = useState({
    batchSize: 50,
    concurrency: 3,
    timeout: 30000,
  })
  const [urls, setUrls] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleOptionChange = (key: keyof typeof options, value: number) => {
    setOptions((prev) => ({
      ...prev,
      [key]: value,
    }))
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const content = event.target?.result as string
          const data = JSON.parse(content)
          setResults({
            type: "import",
            data,
            count: Array.isArray(data) ? data.length : 1,
          })
          toast({
            title: "File Imported",
            description: `Successfully imported ${Array.isArray(data) ? data.length : 1} items`,
          })
        } catch (err) {
          setError("Invalid JSON file")
          toast({
            title: "Import Error",
            description: "The file contains invalid JSON data",
            variant: "destructive",
          })
        }
      }
      reader.readAsText(file)
    } catch (err) {
      setError("Failed to read file")
      toast({
        title: "Import Error",
        description: "Failed to read the uploaded file",
        variant: "destructive",
      })
    }
  }

  const handleUrlImport = () => {
    if (!urls.trim()) {
      toast({
        title: "Import Error",
        description: "Please enter at least one URL",
        variant: "destructive",
      })
      return
    }

    const urlList = urls
      .split("\n")
      .map((url) => url.trim())
      .filter((url) => url.length > 0)

    if (urlList.length === 0) {
      toast({
        title: "Import Error",
        description: "No valid URLs found",
        variant: "destructive",
      })
      return
    }

    setResults({
      type: "urls",
      data: urlList,
      count: urlList.length,
    })

    toast({
      title: "URLs Imported",
      description: `Successfully imported ${urlList.length} URLs`,
    })
  }

  const handleProcessBatch = async () => {
    if (!results) {
      toast({
        title: "Processing Error",
        description: "No data to process",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)
    setProgress(0)
    setError(null)

    try {
      // In a real implementation, this would call an API endpoint
      // that triggers the batch processing on the server
      const response = await fetch("/api/admin/batch-process", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: results.data,
          type: results.type,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to process batch")
      }

      // Simulate progress updates
      const interval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = prev + Math.random() * 10
          if (newProgress >= 100) {
            clearInterval(interval)
            return 100
          }
          return newProgress
        })
      }, 500)

      const data = await response.json()

      // Ensure progress reaches 100% when done
      clearInterval(interval)
      setProgress(100)

      setResults({
        ...results,
        processed: data.processed,
        failed: data.failed,
        output: data.results,
      })

      toast({
        title: "Processing Complete",
        description: `Processed ${data.processed} items with ${data.failed} failures`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      toast({
        title: "Processing Error",
        description: err instanceof Error ? err.message : "Failed to process batch",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const handleDownloadResults = () => {
    if (!results?.output) return

    const blob = new Blob([JSON.stringify(results.output, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `batch-results-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Download Started",
      description: "Your results file is being downloaded",
    })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Batch Data Processor</CardTitle>
        <CardDescription>Process large datasets in batches for improved performance</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="import">Import Data</TabsTrigger>
            <TabsTrigger value="options">Processing Options</TabsTrigger>
            <TabsTrigger value="results">Results</TabsTrigger>
          </TabsList>

          <TabsContent value="import" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Upload JSON File</h3>
                <div className="flex items-center gap-2">
                  <Input ref={fileInputRef} type="file" accept=".json" onChange={handleFileUpload} className="hidden" />
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full h-24 flex flex-col items-center justify-center border-dashed"
                  >
                    <Upload className="h-6 w-6 mb-2" />
                    <span>Click to upload JSON file</span>
                    <span className="text-xs text-muted-foreground mt-1">or drag and drop</span>
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Or Enter URLs (one per line)</h3>
                <Textarea
                  placeholder="https://example.com/page1&#10;https://example.com/page2"
                  value={urls}
                  onChange={(e) => setUrls(e.target.value)}
                  rows={5}
                />
                <Button variant="outline" onClick={handleUrlImport} className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Import URLs
                </Button>
              </div>

              {results && (
                <Alert variant="default">
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Data Ready</AlertTitle>
                  <AlertDescription>
                    {results.count} {results.count === 1 ? "item" : "items"} imported and ready for processing
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>

          <TabsContent value="options" className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="batchSize">
                  Batch Size: {options.batchSize} {options.batchSize === 1 ? "item" : "items"}
                </Label>
                <Slider
                  id="batchSize"
                  min={1}
                  max={100}
                  step={1}
                  value={[options.batchSize]}
                  onValueChange={(value) => handleOptionChange("batchSize", value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Number of items to process in each batch. Smaller batches use less memory but may be slower overall.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="concurrency">
                  Concurrency: {options.concurrency} {options.concurrency === 1 ? "batch" : "batches"}
                </Label>
                <Slider
                  id="concurrency"
                  min={1}
                  max={10}
                  step={1}
                  value={[options.concurrency]}
                  onValueChange={(value) => handleOptionChange("concurrency", value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Number of batches to process simultaneously. Higher values may improve speed but increase resource
                  usage.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeout">
                  Timeout: {options.timeout / 1000} {options.timeout / 1000 === 1 ? "second" : "seconds"}
                </Label>
                <Slider
                  id="timeout"
                  min={5000}
                  max={120000}
                  step={5000}
                  value={[options.timeout]}
                  onValueChange={(value) => handleOptionChange("timeout", value[0])}
                />
                <p className="text-xs text-muted-foreground">
                  Maximum time allowed for each batch to complete before timing out.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="results" className="space-y-4">
            {isProcessing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Processing data...</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
                <Alert>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <AlertTitle>Processing in Progress</AlertTitle>
                  <AlertDescription>
                    Processing {results?.count} items in batches of {options.batchSize}. This may take a while for large
                    datasets.
                  </AlertDescription>
                </Alert>
              </div>
            ) : results?.processed ? (
              <div className="space-y-4">
                <Alert variant={results.failed > 0 ? "warning" : "success"}>
                  {results.failed > 0 ? <AlertCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  <AlertTitle>Processing Complete</AlertTitle>
                  <AlertDescription>
                    Successfully processed {results.processed - results.failed} of {results.processed} items
                    {results.failed > 0 ? ` (${results.failed} failed)` : ""}
                  </AlertDescription>
                </Alert>

                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium mb-2">Results Preview</h3>
                  <pre className="text-xs bg-muted p-2 rounded-md overflow-auto max-h-60">
                    {JSON.stringify(results.output?.slice(0, 5), null, 2)}
                    {results.output?.length > 5 && "\n\n... and more items"}
                  </pre>
                </div>

                <Button variant="outline" onClick={handleDownloadResults} className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Download Full Results
                </Button>
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Processing Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold">No Results Yet</h3>
                <p className="text-muted-foreground max-w-md mt-1">
                  Import data and run the batch processor to see results here.
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter>
        <Button onClick={handleProcessBatch} disabled={isProcessing || !results} className="w-full">
          {isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Process Batch
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
