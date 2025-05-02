"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Upload, X, AlertCircle, CheckCircle2, Info, FileDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { importUsersFromCSV } from "@/app/actions/admin/import-users"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Link from "next/link"

type ImportResult = {
  success: boolean
  created: number
  updated: number
  skipped: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
  warnings: Array<{ row: number; email: string; message: string }>
}

export function ImportUsersModal() {
  const [open, setOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [activeTab, setActiveTab] = useState<string>("errors")
  const [updateExisting, setUpdateExisting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setResult(null)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
      setResult(null)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const resetForm = () => {
    setFile(null)
    setResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleImport = async () => {
    if (!file) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("updateIfExists", updateExisting.toString())

      const importResult = await importUsersFromCSV(formData)
      setResult(importResult)

      // Set the active tab based on results
      if (importResult.errors.length > 0) {
        setActiveTab("errors")
      } else if (importResult.warnings.length > 0) {
        setActiveTab("warnings")
      } else {
        setActiveTab("summary")
      }
    } catch (error) {
      console.error("Error importing users:", error)
      setResult({
        success: false,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [{ row: 0, email: "", error: "An unexpected error occurred" }],
        warnings: [],
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleClose = () => {
    setOpen(false)
    setTimeout(() => {
      resetForm()
    }, 300)
  }

  const totalProcessed = result ? result.created + result.updated + result.skipped + result.failed : 0
  const successRate =
    totalProcessed > 0 ? (((result?.created || 0) + (result?.updated || 0)) / totalProcessed) * 100 : 0

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="mr-2 h-4 w-4" />
          Import Users
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Import Explorer Users</DialogTitle>
          <DialogDescription>Upload a CSV file to create or update explorer accounts.</DialogDescription>
        </DialogHeader>

        {!result ? (
          <>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
              <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium">{file.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation()
                      resetForm()
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div>
                  <p className="font-medium mb-1">Click to upload or drag and drop</p>
                  <p className="text-sm text-muted-foreground">CSV files only (.csv)</p>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Switch id="update-existing" checked={updateExisting} onCheckedChange={setUpdateExisting} />
              <Label htmlFor="update-existing">Update existing users if email already exists</Label>
            </div>

            <div className="bg-muted rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium">CSV Format Requirements</h4>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/api/admin/users/template">
                    <FileDown className="mr-2 h-4 w-4" />
                    Download Template
                  </Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mb-2">Your CSV file should include the following columns:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-sm">
                  <span className="font-semibold">Required Fields:</span>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>
                      <strong>email</strong> - Valid email format
                    </li>
                    <li>
                      <strong>full_name</strong> - User's full name
                    </li>
                  </ul>
                </div>
                <div className="text-sm">
                  <span className="font-semibold">Optional Fields:</span>
                  <ul className="list-disc pl-5 space-y-1 mt-1">
                    <li>
                      <strong>username</strong> - Unique username
                    </li>
                    <li>
                      <strong>avatar_url</strong> - URL to profile image
                    </li>
                    <li>
                      <strong>bio</strong> - Short biography
                    </li>
                    <li>
                      <strong>location</strong> - User's location
                    </li>
                    <li>
                      <strong>update_if_exists</strong> - "true" or "false"
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            {result.success ? (
              <Alert className="border-green-200 bg-green-50 text-green-800">
                <CheckCircle2 className="h-4 w-4" />
                <AlertTitle>Import Completed</AlertTitle>
                <AlertDescription>
                  Successfully processed {totalProcessed} entries with {successRate.toFixed(1)}% success rate.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Import Failed</AlertTitle>
                <AlertDescription>Failed to import users. Please check the error details below.</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Import Summary</span>
                <span>
                  {result.created + result.updated} of {totalProcessed} successful
                </span>
              </div>
              <Progress value={successRate} className="h-2" />

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                <div className="bg-green-50 border border-green-100 rounded p-2 text-center">
                  <div className="text-green-600 font-semibold">{result.created}</div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
                <div className="bg-blue-50 border border-blue-100 rounded p-2 text-center">
                  <div className="text-blue-600 font-semibold">{result.updated}</div>
                  <div className="text-xs text-muted-foreground">Updated</div>
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded p-2 text-center">
                  <div className="text-amber-600 font-semibold">{result.skipped}</div>
                  <div className="text-xs text-muted-foreground">Skipped</div>
                </div>
                <div className="bg-red-50 border border-red-100 rounded p-2 text-center">
                  <div className="text-red-600 font-semibold">{result.failed}</div>
                  <div className="text-xs text-muted-foreground">Failed</div>
                </div>
              </div>
            </div>

            {(result.errors.length > 0 || result.warnings.length > 0) && (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="errors" disabled={result.errors.length === 0}>
                    Errors ({result.errors.length})
                  </TabsTrigger>
                  <TabsTrigger value="warnings" disabled={result.warnings.length === 0}>
                    Warnings ({result.warnings.length})
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="errors" className="mt-2">
                  {result.errors.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Error</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.errors.map((error, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs">{error.row}</td>
                              <td className="px-3 py-2 text-xs">{error.email || "N/A"}</td>
                              <td className="px-3 py-2 text-xs">{error.error}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No errors found</div>
                  )}
                </TabsContent>
                <TabsContent value="warnings" className="mt-2">
                  {result.warnings.length > 0 ? (
                    <div className="max-h-60 overflow-y-auto border rounded-md">
                      <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Row</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Email</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-muted-foreground">Warning</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {result.warnings.map((warning, index) => (
                            <tr key={index}>
                              <td className="px-3 py-2 text-xs">{warning.row}</td>
                              <td className="px-3 py-2 text-xs">{warning.email || "N/A"}</td>
                              <td className="px-3 py-2 text-xs">{warning.message}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 text-muted-foreground">No warnings found</div>
                  )}
                </TabsContent>
              </Tabs>
            )}

            {result.success && (
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Next Steps</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Users have been created with temporary passwords. They will need to use the password reset function
                    on first login.
                  </p>
                  <p>Consider sending a welcome email to notify them about their new accounts.</p>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        <DialogFooter>
          {!result ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleImport} disabled={!file || isUploading}>
                {isUploading ? "Importing..." : "Import Users"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={resetForm}>
                Import Another File
              </Button>
              <Button onClick={handleClose}>Done</Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
