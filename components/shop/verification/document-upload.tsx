"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Upload, X, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface DocumentUploadProps {
  shopId: string
  onUploadComplete: (urls: { businessLicenseUrl?: string; proofOfOwnershipUrl?: string }) => void
  existingBusinessLicense?: string
  existingProofOfOwnership?: string
}

export function DocumentUpload({
  shopId,
  onUploadComplete,
  existingBusinessLicense,
  existingProofOfOwnership,
}: DocumentUploadProps) {
  const [businessLicenseFile, setBusinessLicenseFile] = useState<File | null>(null)
  const [proofOfOwnershipFile, setProofOfOwnershipFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const businessLicenseRef = useRef<HTMLInputElement>(null)
  const proofOfOwnershipRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const supabase = createClient()

  const handleBusinessLicenseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBusinessLicenseFile(e.target.files[0])
    }
  }

  const handleProofOfOwnershipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofOfOwnershipFile(e.target.files[0])
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, type: "license" | "proof") => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      if (type === "license") {
        setBusinessLicenseFile(e.dataTransfer.files[0])
      } else {
        setProofOfOwnershipFile(e.dataTransfer.files[0])
      }
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const uploadDocuments = async () => {
    setIsUploading(true)
    setUploadError(null)

    try {
      const urls: { businessLicenseUrl?: string; proofOfOwnershipUrl?: string } = {}

      // Upload business license if provided
      if (businessLicenseFile) {
        const fileName = `${shopId}/business-license-${Date.now()}.${businessLicenseFile.name.split(".").pop()}`
        const { data: licenseData, error: licenseError } = await supabase.storage
          .from("verification-documents")
          .upload(fileName, businessLicenseFile)

        if (licenseError) throw new Error(`Failed to upload business license: ${licenseError.message}`)

        const { data: licenseUrl } = supabase.storage.from("verification-documents").getPublicUrl(fileName)

        urls.businessLicenseUrl = licenseUrl.publicUrl
      } else if (existingBusinessLicense) {
        urls.businessLicenseUrl = existingBusinessLicense
      }

      // Upload proof of ownership if provided
      if (proofOfOwnershipFile) {
        const fileName = `${shopId}/proof-of-ownership-${Date.now()}.${proofOfOwnershipFile.name.split(".").pop()}`
        const { data: proofData, error: proofError } = await supabase.storage
          .from("verification-documents")
          .upload(fileName, proofOfOwnershipFile)

        if (proofError) throw new Error(`Failed to upload proof of ownership: ${proofError.message}`)

        const { data: proofUrl } = supabase.storage.from("verification-documents").getPublicUrl(fileName)

        urls.proofOfOwnershipUrl = proofUrl.publicUrl
      } else if (existingProofOfOwnership) {
        urls.proofOfOwnershipUrl = existingProofOfOwnership
      }

      onUploadComplete(urls)

      toast({
        title: "Documents uploaded successfully",
        description: "Your verification documents have been uploaded.",
      })
    } catch (error) {
      console.error("Error uploading documents:", error)
      setUploadError(error instanceof Error ? error.message : "Failed to upload documents")

      toast({
        variant: "destructive",
        title: "Upload failed",
        description: "There was an error uploading your documents. Please try again.",
      })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Business License</CardTitle>
          <CardDescription>
            Upload a copy of your business license or permit that shows you are authorized to operate.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
              businessLicenseFile ? "border-primary/50 bg-primary/5" : ""
            }`}
            onDrop={(e) => handleDrop(e, "license")}
            onDragOver={handleDragOver}
            onClick={() => businessLicenseRef.current?.click()}
          >
            <input
              type="file"
              ref={businessLicenseRef}
              onChange={handleBusinessLicenseChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            {businessLicenseFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{businessLicenseFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    setBusinessLicenseFile(null)
                    if (businessLicenseRef.current) businessLicenseRef.current.value = ""
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : existingBusinessLicense ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Document already uploaded</p>
                  <p className="text-sm text-muted-foreground">Click to replace</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PDF, JPG or PNG (max. 10MB)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proof of Ownership</CardTitle>
          <CardDescription>
            Upload a document that proves you are the owner or authorized representative of this business.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors ${
              proofOfOwnershipFile ? "border-primary/50 bg-primary/5" : ""
            }`}
            onDrop={(e) => handleDrop(e, "proof")}
            onDragOver={handleDragOver}
            onClick={() => proofOfOwnershipRef.current?.click()}
          >
            <input
              type="file"
              ref={proofOfOwnershipRef}
              onChange={handleProofOfOwnershipChange}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
            />
            {proofOfOwnershipFile ? (
              <div className="flex items-center justify-center gap-2">
                <FileText className="h-8 w-8 text-primary" />
                <div>
                  <p className="font-medium">{proofOfOwnershipFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(proofOfOwnershipFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={(e) => {
                    e.stopPropagation()
                    setProofOfOwnershipFile(null)
                    if (proofOfOwnershipRef.current) proofOfOwnershipRef.current.value = ""
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : existingProofOfOwnership ? (
              <div className="flex items-center justify-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div>
                  <p className="font-medium">Document already uploaded</p>
                  <p className="text-sm text-muted-foreground">Click to replace</p>
                </div>
              </div>
            ) : (
              <div>
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">Click to upload or drag and drop</p>
                <p className="text-sm text-muted-foreground">PDF, JPG or PNG (max. 10MB)</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Upload Error</AlertTitle>
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end">
        <Button onClick={uploadDocuments} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload Documents"}
        </Button>
      </div>
    </div>
  )
}
