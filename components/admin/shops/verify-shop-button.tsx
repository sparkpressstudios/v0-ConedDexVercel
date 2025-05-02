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
} from "@/components/ui/dialog"
import { Shield, CheckCircle, XCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

interface VerifyShopButtonProps {
  shopId: string
  shopName: string
  isVerified: boolean
  ownerId: string
}

export function VerifyShopButton({ shopId, shopName, isVerified, ownerId }: VerifyShopButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleVerify = async () => {
    setIsLoading(true)
    try {
      // Update shop verification status
      const { error } = await supabase
        .from("shops")
        .update({ is_verified: true, verified_at: new Date().toISOString() })
        .eq("id", shopId)

      if (error) throw error

      // Create notification for shop owner
      await supabase.from("notifications").insert({
        user_id: ownerId,
        title: "Shop Verified",
        content: `Your shop "${shopName}" has been verified by the ConeDex team.`,
        type: "shop_verified",
        read: false,
      })

      // Send email notification
      // This would typically call a server action or API route
      // For now, we'll just simulate success

      toast({
        title: "Shop Verified",
        description: `${shopName} has been successfully verified.`,
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error verifying shop:", error)
      toast({
        title: "Verification Failed",
        description: "There was an error verifying this shop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnverify = async () => {
    setIsLoading(true)
    try {
      // Update shop verification status
      const { error } = await supabase.from("shops").update({ is_verified: false, verified_at: null }).eq("id", shopId)

      if (error) throw error

      // Create notification for shop owner
      await supabase.from("notifications").insert({
        user_id: ownerId,
        title: "Shop Verification Removed",
        content: `The verification status for "${shopName}" has been removed. Please contact support for more information.`,
        type: "shop_unverified",
        read: false,
      })

      toast({
        title: "Verification Removed",
        description: `Verification status has been removed from ${shopName}.`,
      })

      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error removing verification:", error)
      toast({
        title: "Action Failed",
        description: "There was an error updating this shop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button
        variant={isVerified ? "outline" : "default"}
        onClick={() => setIsOpen(true)}
        className={isVerified ? "border-green-500 text-green-500 hover:bg-green-50" : ""}
      >
        <Shield className="h-4 w-4 mr-2" />
        {isVerified ? "Verified" : "Verify Shop"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isVerified ? "Remove Verification?" : "Verify Shop"}</DialogTitle>
            <DialogDescription>
              {isVerified
                ? `Are you sure you want to remove the verification status from "${shopName}"?`
                : `Are you sure you want to verify "${shopName}"? This will mark the shop as officially verified by ConeDex.`}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            {isVerified ? (
              <Button variant="destructive" onClick={handleUnverify} disabled={isLoading} className="gap-2">
                {isLoading ? "Processing..." : "Remove Verification"}
                <XCircle className="h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleVerify} disabled={isLoading} className="gap-2">
                {isLoading ? "Processing..." : "Verify Shop"}
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
