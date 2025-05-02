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
import { Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DeleteShopButtonProps {
  shopId: string
  shopName: string
}

export function DeleteShopButton({ shopId, shopName }: DeleteShopButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (confirmText !== shopName) {
      toast({
        title: "Confirmation Failed",
        description: "The shop name you entered doesn't match. Please try again.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // First, check if there are any dependencies that would prevent deletion
      const { count: flavorCount, error: flavorError } = await supabase
        .from("flavors")
        .select("*", { count: "exact", head: true })
        .eq("shop_id", shopId)

      if (flavorError) throw flavorError

      if (flavorCount && flavorCount > 0) {
        toast({
          title: "Cannot Delete Shop",
          description: `This shop has ${flavorCount} flavors associated with it. Please delete or reassign these flavors first.`,
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      // Delete shop
      const { error } = await supabase.from("shops").delete().eq("id", shopId)

      if (error) throw error

      toast({
        title: "Shop Deleted",
        description: `${shopName} has been successfully deleted.`,
      })

      setIsOpen(false)
      router.push("/dashboard/admin/shops")
    } catch (error) {
      console.error("Error deleting shop:", error)
      toast({
        title: "Deletion Failed",
        description: "There was an error deleting this shop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        <Trash2 className="h-4 w-4 mr-2" />
        Delete Shop
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Shop</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{shopName}"? This action cannot be undone and will permanently remove all
              shop data.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="confirm">
                Type <span className="font-semibold">{shopName}</span> to confirm deletion
              </Label>
              <Input
                id="confirm"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={shopName}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading || confirmText !== shopName}>
              {isLoading ? "Deleting..." : "Delete Shop"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
