"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, FileSpreadsheet, AlertCircle, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import ImportProgress from "@/components/admin/batch-import/import-progress"

export default function ImportShopsPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("csv")
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importId, setImportId] = useState<string | null>(null)
  const [importStarted, setImportStarted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setError(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleImport = async () => {
    if (!file) {
      setError("Please select a file to import")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/admin/shops/import", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to start import")
      }

      setImportId(data.importId)
      setImportStarted(true)
    } catch (err) {
      console.error("Error starting import:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImportComplete = () => {
    // Wait a moment before redirecting to allow user to see the completion state
    setTimeout(() => {
      router.push("/dashboard/admin/shops")
    }, 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/admin/shops">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Import Shops</h1>
      </div>

      {importStarted && importId ? (
        <ImportProgress
          importId={importId}
          title="Shop Import Progress"
          entityType="shops"
          onComplete={handleImportComplete}
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Import Shops</CardTitle>
            <CardDescription>
              Add multiple shops to the ConeDex platform by importing from a CSV file or using the Google Places API.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="csv">CSV Import</TabsTrigger>
                <TabsTrigger value="places">Google Places</TabsTrigger>
              </TabsList>

              <TabsContent value="csv" className="space-y-4 pt-4">
                <div
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
                    error ? "border-red-300" : ""
                  }`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => document.getElementById("file-upload")?.click()}
                >
                  <input id="file-upload" type="file" className="hidden" accept=".csv" onChange={handleFileChange} />
                  <FileSpreadsheet className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                  {file ? (
                    <div>
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">{(file.size / 1024).toFixed(2)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="font-medium mb-1">Click to upload or drag and drop</p>
                      <p className="text-sm text-muted-foreground">CSV files only (.csv)</p>
                    </div>
                  )}
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <div className="bg-muted rounded-lg p-4">
                  <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Your CSV file should include the following columns:
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                    <div className="text-sm">
                      <span className="font-semibold">Required Fields:</span>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>
                          <strong>name</strong> - Shop name
                        </li>
                        <li>
                          <strong>address</strong> - Street address
                        </li>
                      </ul>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold">Optional Fields:</span>
                      <ul className="list-disc pl-5 space-y-1 mt-1">
                        <li>
                          <strong>city</strong> - City name
                        </li>
                        <li>
                          <strong>state</strong> - State/Province
                        </li>
                        <li>
                          <strong>phone</strong> - Phone number
                        </li>
                        <li>
                          <strong>website</strong> - Website URL
                        </li>
                        <li>
                          <strong>lat</strong> - Latitude
                        </li>
                        <li>
                          <strong>lng</strong> - Longitude
                        </li>
                        <li>
                          <strong>image_url</strong> - Image URL
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="places" className="pt-4">
                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Google Places Integration</AlertTitle>
                  <AlertDescription>
                    Use the Google Places API to search for and import ice cream shops by location. This feature is
                    coming soon.
                  </AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button onClick={handleImport} disabled={!file || isUploading} className="ml-auto">
              {isUploading ? "Uploading..." : "Start Import"}
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
