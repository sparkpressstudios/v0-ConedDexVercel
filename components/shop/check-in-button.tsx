"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CheckInButtonProps extends ButtonProps {
  shopId: string
  shopName: string
  availableFlavors?: Array<{ id: string; name: string }>
  userId?: string
}

export function CheckInButton({ shopId, shopName, availableFlavors = [], userId, ...props }: CheckInButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const handleCheckIn = async () => {
    if (!userId) {
      toast({
        title: "Login required",
        description: "Please log in to check in to shops",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const { error } = await supabase.from("shop_checkins").insert({
        shop_id: shopId,
        user_id: userId,
        flavor_ids: selectedFlavors.length > 0 ? selectedFlavors : null,
      })

      if (error) throw error

      toast({
        title: "Check-in successful!",
        description: `You've checked in to ${shopName}`,
        variant: "default",
      })
      setIsOpen(false)
      router.refresh()
    } catch (error) {
      console.error("Error checking in:", error)
      toast({
        title: "Check-in failed",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const toggleFlavor = (flavorId: string) => {
    setSelectedFlavors((prev) => (prev.includes(flavorId) ? prev.filter((id) => id !== flavorId) : [...prev, flavorId]))
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-1" {...props}>
          <MapPin className="h-4 w-4" />
          <span>Check In</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Check in to {shopName}</DialogTitle>
          <DialogDescription>
            Record your visit to this ice cream shop and track your ConeDex journey!
          </DialogDescription>
        </DialogHeader>

        {availableFlavors.length > 0 && (
          <div className="py-4">
            <h4 className="mb-3 font-medium">Which flavors did you try?</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableFlavors.map((flavor) => (
                <div key={flavor.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`flavor-${flavor.id}`}
                    checked={selectedFlavors.includes(flavor.id)}
                    onCheckedChange={() => toggleFlavor(flavor.id)}
                  />
                  <Label htmlFor={`flavor-${flavor.id}`}>{flavor.name}</Label>
                </div>
              ))}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCheckIn} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Checking in...
              </>
            ) : (
              "Check In Now"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default CheckInButton
