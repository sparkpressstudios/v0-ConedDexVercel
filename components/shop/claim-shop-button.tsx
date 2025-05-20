"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Store } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface ClaimShopButtonProps {
  shopId: string
  shopName: string
  userId?: string
}

export function ClaimShopButton({ shopId, shopName, userId }: ClaimShopButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [ownerName, setOwnerName] = useState("")
  const [contactEmail, setContactEmail] = useState("")
  const [verificationInfo, setVerificationInfo] = useState("")

  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleSubmitClaim = async () => {
    if (!userId) {
      toast({
        title: "Login required",
        description: "Please log in to claim a shop",
        variant: "destructive",
      })
      return
    }

    if (!ownerName || !contactEmail || !verificationInfo) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("shop_claims").insert({
        shop_id: shopId,
        user_id: userId,
        owner_name: ownerName,
        contact_email: contactEmail,
        verification_info: verificationInfo,
        status: "pending",
      })

      if (error) throw error

      toast({
        title: "Claim submitted!",
        description: "Your claim has been submitted and is pending review",
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error submitting claim:", error)
      toast({
        title: "Submission failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full gap-2">
          <Store className="h-4 w-4" />
          Claim This Shop
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim {shopName}</DialogTitle>
          <DialogDescription>
            Submit a claim to verify that you are the owner of this shop. Our team will review your claim and contact
            you.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="owner-name">Owner Name *</Label>
            <Input
              id="owner-name"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Your full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Contact Email *</Label>
            <Input
              id="contact-email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder="Your business email"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="verification-info">
              Verification Information *
              <span className="block text-xs text-muted-foreground mt-1">
                Please provide information that can help us verify your ownership (e.g., business license number,
                website admin access, or other proof of ownership)
              </span>
            </Label>
            <Textarea
              id="verification-info"
              value={verificationInfo}
              onChange={(e) => setVerificationInfo(e.target.value)}
              placeholder="Information to verify your ownership"
              rows={4}
              required
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmitClaim} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Claim"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
