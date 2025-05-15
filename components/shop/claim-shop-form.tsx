"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Store, Upload } from "lucide-react"
import { submitShopClaim } from "@/app/actions/shop-claim-actions"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

// Form schema
const claimFormSchema = z.object({
  ownershipProof: z.enum(["business_card", "license", "utility_bill", "other"], {
    required_error: "Please select a proof of ownership",
  }),
  otherProof: z.string().optional(),
  contactEmail: z.string().email("Please enter a valid email address"),
  contactPhone: z.string().min(10, "Please enter a valid phone number"),
  additionalInfo: z.string().optional(),
  termsAccepted: z.literal(true, {
    invalid_type_error: "You must accept the terms to continue",
  }),
})

type ClaimFormValues = z.infer<typeof claimFormSchema>

interface ClaimShopFormProps {
  shop: {
    id: string
    name: string
    address?: string
    image_url?: string
  }
}

export function ClaimShopForm({ shop }: ClaimShopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()

  const form = useForm<ClaimFormValues>({
    resolver: zodResolver(claimFormSchema),
    defaultValues: {
      ownershipProof: "business_card",
      contactEmail: user?.email || "",
      contactPhone: "",
      additionalInfo: "",
      termsAccepted: false,
    },
  })

  const onSubmit = async (data: ClaimFormValues) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to claim a shop",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const verificationData = {
        ...data,
        submittedAt: new Date().toISOString(),
      }

      const result = await submitShopClaim(shop.id, user.id, verificationData)

      if (result.success) {
        setIsSuccess(true)
        toast({
          title: "Claim submitted successfully",
          description: "We'll review your claim and get back to you soon",
        })
      } else {
        setError(result.error || "Failed to submit claim")
        toast({
          title: "Error submitting claim",
          description: result.error || "An unexpected error occurred",
          variant: "destructive",
        })
      }
    } catch (err) {
      console.error("Error submitting claim:", err)
      setError("An unexpected error occurred. Please try again.")
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-center text-green-600">Claim Submitted Successfully</CardTitle>
          <CardDescription className="text-center">Thank you for submitting your claim for {shop.name}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center space-y-4 pt-6">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <p className="text-center text-muted-foreground">
            We've received your claim and will review it as soon as possible. You'll receive a notification once the
            review is complete.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push("/dashboard")}>Return to Dashboard</Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Claim {shop.name}
        </CardTitle>
        <CardDescription>
          Submit your ownership claim for this shop. Once verified, you'll be able to manage your shop profile, menu,
          and more.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="ownershipProof"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormLabel>Proof of Ownership</FormLabel>
                  <FormDescription>
                    Select the type of document you can provide to verify your ownership
                  </FormDescription>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-col space-y-1"
                    >
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="business_card" />
                        </FormControl>
                        <FormLabel className="font-normal">Business Card</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="license" />
                        </FormControl>
                        <FormLabel className="font-normal">Business License</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="utility_bill" />
                        </FormControl>
                        <FormLabel className="font-normal">Utility Bill</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="other" />
                        </FormControl>
                        <FormLabel className="font-normal">Other</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("ownershipProof") === "other" && (
              <FormField
                control={form.control}
                name="otherProof"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Please specify</FormLabel>
                    <FormControl>
                      <Input placeholder="Describe your proof of ownership" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
              <FormField
                control={form.control}
                name="contactEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Contact Email</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactPhone"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Contact Phone</FormLabel>
                    <FormControl>
                      <Input placeholder="(123) 456-7890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalInfo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Information</FormLabel>
                  <FormDescription>
                    Provide any additional details that might help us verify your ownership
                  </FormDescription>
                  <FormControl>
                    <Textarea placeholder="I've owned this shop since 2018..." className="min-h-[100px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="rounded-md border p-4">
              <div className="flex items-center gap-3">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <div className="text-sm font-medium">Upload Verification Document</div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Please upload a document that proves your ownership of this shop. This will be reviewed by our team.
              </p>
              <Button variant="outline" size="sm" className="mt-4">
                Select File
              </Button>
              <p className="mt-2 text-xs text-muted-foreground">Supported formats: PDF, JPG, PNG (Max size: 5MB)</p>
            </div>

            <FormField
              control={form.control}
              name="termsAccepted"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>I confirm that I am the owner or authorized representative of this business</FormLabel>
                    <FormDescription>
                      By submitting this claim, you agree to our{" "}
                      <a href="/terms" className="text-primary underline">
                        Terms of Service
                      </a>{" "}
                      and{" "}
                      <a href="/privacy" className="text-primary underline">
                        Privacy Policy
                      </a>
                      .
                    </FormDescription>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Claim"}
        </Button>
      </CardFooter>
    </Card>
  )
}
