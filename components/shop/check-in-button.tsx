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
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Loader2, MapPin } from "lucide-react"
import { checkInToShop } from "@/app/actions/shop-checkin-actions"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface CheckInButtonProps {
  shopId: string
  shopName: string
  availableFlavors?: Array<{ id: string; name: string }>
}

export default function CheckInButton({ shopId, shopName, availableFlavors = [] }: CheckInButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>([])
  const { toast } = useToast()
  const router = useRouter()

  const handleCheckIn = async () => {
    setIsLoading(true)
    try {
      const result = await checkInToShop(shopId, selectedFlavors)

      if (result.success) {
        toast({
          title: "Check-in successful!",
          description: `You've checked in to ${shopName}`,
          variant: "default",
        })
        setIsOpen(false)
        router.refresh()
      } else {
        toast({
          title: "Check-in failed",
          description: result.error || "Something went wrong",
          variant: "destructive",
        })
      }
    } catch (error) {
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
        <Button className="flex items-center gap-1">
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
