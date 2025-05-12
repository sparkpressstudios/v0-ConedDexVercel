"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Store, MapPin, Phone, Globe } from "lucide-react"
import { ShopImageGallery } from "@/components/shop/shop-image-gallery"

interface ClaimShopFormProps {
  shop: any
  userId: string
}

export function ClaimShopForm({ shop, userId }: ClaimShopFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [verificationInfo, setVerificationInfo] = useState({
    ownerName: "",
    ownerPosition: "",
    ownerEmail: "",
    ownerPhone: "",
    verificationNotes: "",
  })
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setVerificationInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create a claim request
      const { data, error } = await supabase.from("shop_claims").insert({
        shop_id: shop.id,
        user_id: userId,
        status: "pending",
        owner_name: verificationInfo.ownerName,
        owner_position: verificationInfo.ownerPosition,
        owner_email: verificationInfo.ownerEmail,
        owner_phone: verificationInfo.ownerPhone,
        verification_notes: verificationInfo.verificationNotes,
        submitted_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update the shop to show it has a pending claim
      await supabase.from("shops").update({ has_claim_request: true }).eq("id", shop.id)

      toast({
        title: "Claim submitted successfully",
        description: "We'll review your claim and get back to you soon.",
      })

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting claim:", error)
      toast({
        title: "Error submitting claim",
        description: "There was a problem submitting your claim. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Shop Details</CardTitle>
          <CardDescription>Review the shop information before claiming</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Shop Image Gallery */}
          <div className="mb-6">
            <ShopImageGallery
              mainImage={shop.mainImage}
              additionalImages={shop.additionalImages}
              shopName={shop.name}
              className="h-64 w-full"
            />
          </div>

          <div className="grid gap-4">
            <div>
              <h3 className="text-xl font-bold flex items-center">
                <Store className="mr-2 h-5 w-5" />
                {shop.name}
              </h3>
              {shop.businessType && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                  {shop.businessType.replace(/_/g, " ")}
                </span>
              )}
            </div>

            <div className="grid gap-2">
              <div className="flex items-start">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground mt-0.5" />
                <span>{shop.address}</span>
              </div>
              {shop.phone && (
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{shop.phone}</span>
                </div>
              )}
              {shop.website && (
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={shop.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {shop.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>

            {shop.description && (
              <div>
                <h4 className="font-medium mb-1">Description</h4>
                <p className="text-sm text-muted-foreground">{shop.description}</p>
              </div>
            )}

            {shop.openingHours && (
              <div>
                <h4 className="font-medium mb-1">Opening Hours</h4>
                <pre className="text-xs whitespace-pre-wrap bg-muted p-2 rounded">{shop.openingHours}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Claim This Shop</CardTitle>
          <CardDescription>Provide verification information to claim ownership of this shop</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner/Manager Name</Label>
                  <Input
                    id="ownerName"
                    name="ownerName"
                    value={verificationInfo.ownerName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPosition">Position/Title</Label>
                  <Input
                    id="ownerPosition"
                    name="ownerPosition"
                    value={verificationInfo.ownerPosition}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ownerEmail">Business Email</Label>
                  <Input
                    id="ownerEmail"
                    name="ownerEmail"
                    type="email"
                    value={verificationInfo.ownerEmail}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerPhone">Business Phone</Label>
                  <Input
                    id="ownerPhone"
                    name="ownerPhone"
                    type="tel"
                    value={verificationInfo.ownerPhone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="verificationNotes">Additional Verification Information</Label>
                <Textarea
                  id="verificationNotes"
                  name="verificationNotes"
                  value={verificationInfo.verificationNotes}
                  onChange={handleChange}
                  placeholder="Please provide any additional information that can help us verify your ownership of this shop."
                  rows={4}
                />
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-md p-4 text-sm text-amber-800">
              <p className="font-medium">Verification Process:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>We'll review your claim within 1-3 business days</li>
                <li>We may contact you via email or phone for verification</li>
                <li>You may need to provide business documentation</li>
                <li>Once verified, you'll have full access to manage this shop profile</li>
              </ul>
            </div>
          </form>
        </CardContent>
        <CardFooter>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Claim...
              </>
            ) : (
              "Submit Claim Request"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
