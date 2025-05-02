"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Upload, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

export default function ShopVerifyPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [verificationType, setVerificationType] = useState("document")
  const [documentType, setDocumentType] = useState("business_license")
  const [documentFile, setDocumentFile] = useState<File | null>(null)
  const [additionalInfo, setAdditionalInfo] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setDocumentFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to submit a verification request",
        variant: "destructive",
      })
      return
    }

    if (verificationType === "document" && !documentFile) {
      toast({
        title: "Document required",
        description: "Please upload a verification document",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Get user's shop
      const { data: shopData, error: shopError } = await supabase
        .from("shops")
        .select("id")
        .eq("owner_id", user.id)
        .single()

      if (shopError) {
        throw new Error("You don't have a shop to verify. Please claim or create a shop first.")
      }

      let fileUrl = null

      // Upload document if provided
      if (documentFile) {
        const fileExt = documentFile.name.split(".").pop()
        const fileName = `${user.id}-${Date.now()}.${fileExt}`
        const filePath = `verification_documents/${fileName}`

        const { error: uploadError, data: uploadData } = await supabase.storage
          .from("shop_verification")
          .upload(filePath, documentFile)

        if (uploadError) throw uploadError

        // Get public URL
        const { data: urlData } = supabase.storage.from("shop_verification").getPublicUrl(filePath)

        fileUrl = urlData.publicUrl
      }

      // Create verification request
      const verificationData = {
        document_type: documentType,
        document_url: fileUrl,
        additional_info: additionalInfo,
      }

      const { error: verificationError } = await supabase.from("shop_verification").insert({
        shop_id: shopData.id,
        user_id: user.id,
        verification_type: verificationType,
        verification_data: verificationData,
        status: "pending",
      })

      if (verificationError) throw verificationError

      setSubmitted(true)
      toast({
        title: "Verification request submitted",
        description: "We'll review your request and get back to you soon",
      })
    } catch (error: any) {
      console.error("Error submitting verification request:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to submit verification request",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Verification Request Submitted</CardTitle>
            <CardDescription className="text-center">
              Thank you for submitting your verification request
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center pt-6">
            <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
            <p className="text-center mb-4">
              We'll review your request and update your shop's verification status within 1-3 business days.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={() => router.push("/dashboard/shop")}>Return to Shop Dashboard</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="icon" asChild className="mr-2">
          <Link href="/dashboard/shop">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Verify Your Shop</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Shop Verification</CardTitle>
          <CardDescription>
            Verify your shop ownership to unlock additional features and build trust with customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label>Verification Method</Label>
                <RadioGroup
                  value={verificationType}
                  onValueChange={setVerificationType}
                  className="flex flex-col space-y-2 mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="document" id="document" />
                    <Label htmlFor="document" className="cursor-pointer">
                      Business Document
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="cursor-pointer">
                      Phone Verification
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="email" />
                    <Label htmlFor="email" className="cursor-pointer">
                      Email Verification
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {verificationType === "document" && (
                <>
                  <div>
                    <Label htmlFor="document-type">Document Type</Label>
                    <select
                      id="document-type"
                      value={documentType}
                      onChange={(e) => setDocumentType(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="business_license">Business License</option>
                      <option value="tax_document">Tax Document</option>
                      <option value="utility_bill">Utility Bill</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="document-upload">Upload Document</Label>
                    <div className="mt-2 flex items-center justify-center w-full">
                      <label
                        htmlFor="document-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, PNG, JPG or JPEG (max. 10MB)</p>
                        </div>
                        <input
                          id="document-upload"
                          type="file"
                          className="hidden"
                          accept=".pdf,.png,.jpg,.jpeg"
                          onChange={handleFileChange}
                        />
                      </label>
                    </div>
                    {documentFile && <p className="mt-2 text-sm text-green-600">File selected: {documentFile.name}</p>}
                  </div>
                </>
              )}

              {verificationType === "phone" && (
                <div>
                  <Label htmlFor="phone-number">Phone Number</Label>
                  <Input id="phone-number" type="tel" placeholder="Enter your business phone number" />
                  <p className="text-sm text-muted-foreground mt-1">We'll send a verification code to this number</p>
                </div>
              )}

              {verificationType === "email" && (
                <div>
                  <Label htmlFor="business-email">Business Email</Label>
                  <Input id="business-email" type="email" placeholder="Enter your business email" />
                  <p className="text-sm text-muted-foreground mt-1">We'll send a verification link to this email</p>
                </div>
              )}

              <div>
                <Label htmlFor="additional-info">Additional Information</Label>
                <Textarea
                  id="additional-info"
                  placeholder="Provide any additional information that might help us verify your shop"
                  value={additionalInfo}
                  onChange={(e) => setAdditionalInfo(e.target.value)}
                  rows={4}
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Verification Request"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
