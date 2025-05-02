"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DocumentUpload } from "./document-upload"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"
import { AlertCircle, CheckCircle } from "lucide-react"

const formSchema = z.object({
  contactEmail: z.string().email({ message: "Please enter a valid email address" }),
  contactPhone: z.string().min(5, { message: "Phone number is too short" }).optional(),
  notes: z.string().max(500, { message: "Notes cannot exceed 500 characters" }).optional(),
})

type FormValues = z.infer<typeof formSchema>

interface VerificationFormProps {
  shopId: string
  shopName: string
  existingRequest?: {
    id: string
    status: "pending" | "approved" | "rejected"
    contactEmail: string
    contactPhone?: string
    notes?: string
    businessLicenseUrl?: string
    proofOfOwnershipUrl?: string
    adminNotes?: string
    createdAt: string
    updatedAt: string
    reviewedAt?: string
  }
}

export function VerificationForm({ shopId, shopName, existingRequest }: VerificationFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [documentUrls, setDocumentUrls] = useState<{
    businessLicenseUrl?: string
    proofOfOwnershipUrl?: string
  }>({
    businessLicenseUrl: existingRequest?.businessLicenseUrl,
    proofOfOwnershipUrl: existingRequest?.proofOfOwnershipUrl,
  })
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      contactEmail: existingRequest?.contactEmail || "",
      contactPhone: existingRequest?.contactPhone || "",
      notes: existingRequest?.notes || "",
    },
  })

  const handleDocumentUpload = (urls: { businessLicenseUrl?: string; proofOfOwnershipUrl?: string }) => {
    setDocumentUrls({
      businessLicenseUrl: urls.businessLicenseUrl || documentUrls.businessLicenseUrl,
      proofOfOwnershipUrl: urls.proofOfOwnershipUrl || documentUrls.proofOfOwnershipUrl,
    })
  }

  const onSubmit = async (values: FormValues) => {
    if (!documentUrls.businessLicenseUrl || !documentUrls.proofOfOwnershipUrl) {
      setError("Please upload both required documents")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      if (existingRequest && existingRequest.status === "pending") {
        // Update existing request
        const { error: updateError } = await supabase
          .from("shop_verification_requests")
          .update({
            contact_email: values.contactEmail,
            contact_phone: values.contactPhone || null,
            notes: values.notes || null,
            business_license_url: documentUrls.businessLicenseUrl,
            proof_of_ownership_url: documentUrls.proofOfOwnershipUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingRequest.id)

        if (updateError) throw updateError

        toast({
          title: "Verification request updated",
          description: "Your verification request has been updated successfully.",
        })
      } else {
        // Create new request
        const { error: insertError } = await supabase.from("shop_verification_requests").insert({
          shop_id: shopId,
          user_id: (await supabase.auth.getUser()).data.user?.id,
          contact_email: values.contactEmail,
          contact_phone: values.contactPhone || null,
          notes: values.notes || null,
          business_license_url: documentUrls.businessLicenseUrl,
          proof_of_ownership_url: documentUrls.proofOfOwnershipUrl,
        })

        if (insertError) throw insertError

        toast({
          title: "Verification request submitted",
          description: "Your verification request has been submitted successfully.",
        })
      }

      // Refresh the page to show the updated status
      router.refresh()
    } catch (err) {
      console.error("Error submitting verification request:", err)
      setError(err instanceof Error ? err.message : "Failed to submit verification request")
    } finally {
      setIsSubmitting(false)
    }
  }

  // If the request is already approved or rejected, show status instead of form
  if (existingRequest && existingRequest.status !== "pending") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>
            Your verification request for {shopName} was submitted on{" "}
            {new Date(existingRequest.createdAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert
            variant={existingRequest.status === "approved" ? "default" : "destructive"}
            className={existingRequest.status === "approved" ? "border-green-200 bg-green-50" : ""}
          >
            {existingRequest.status === "approved" ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle className="capitalize">
              {existingRequest.status === "approved" ? "Verified" : "Verification Rejected"}
            </AlertTitle>
            <AlertDescription>
              {existingRequest.status === "approved"
                ? `Your shop was verified on ${
                    existingRequest.reviewedAt ? new Date(existingRequest.reviewedAt).toLocaleDateString() : "N/A"
                  }`
                : existingRequest.adminNotes || "Your verification request was rejected."}
            </AlertDescription>
          </Alert>

          {existingRequest.status === "rejected" && (
            <div className="mt-6">
              <Button onClick={() => router.push(`/dashboard/shop/verify/new`)}>Submit New Request</Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{existingRequest ? "Update Verification Request" : "Shop Verification Request"}</CardTitle>
          <CardDescription>
            {existingRequest
              ? `Update your verification request for ${shopName}`
              : `Submit documents to verify your ownership of ${shopName}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="contact@yourshop.com" {...field} />
                    </FormControl>
                    <FormDescription>
                      This email will be used for communication regarding your verification request.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Phone (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="+1 (555) 123-4567" {...field} />
                    </FormControl>
                    <FormDescription>Provide a phone number where we can reach you if needed.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Additional Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Any additional information that might help with verification..."
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Include any additional details that might help with the verification process.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="pt-4">
                <h3 className="text-lg font-medium mb-4">Required Documents</h3>
                <DocumentUpload
                  shopId={shopId}
                  onUploadComplete={handleDocumentUpload}
                  existingBusinessLicense={existingRequest?.businessLicenseUrl}
                  existingProofOfOwnership={existingRequest?.proofOfOwnershipUrl}
                />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex justify-end">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting
                    ? "Submitting..."
                    : existingRequest
                      ? "Update Verification Request"
                      : "Submit Verification Request"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {existingRequest && existingRequest.status === "pending" && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Verification Pending</AlertTitle>
          <AlertDescription>
            Your verification request is currently under review. This process typically takes 1-3 business days.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
