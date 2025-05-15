"use client"

import { useState } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { CheckCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface CheckInButtonProps extends ButtonProps {
  shopId: string
  userId?: string
}

export function CheckInButton({ shopId, userId, ...props }: CheckInButtonProps) {
  const [isCheckedIn, setIsCheckedIn] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const { toast } = useToast()

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
      })

      if (error) throw error

      setIsCheckedIn(true)
      toast({
        title: "Checked in!",
        description: "You've successfully checked in to this shop",
      })
    } catch (error) {
      console.error("Error checking in:", error)
      toast({
        title: "Check-in failed",
        description: "There was an error checking in to this shop",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button onClick={handleCheckIn} disabled={isCheckedIn || isLoading} {...props}>
      {isCheckedIn ? (
        <>
          <CheckCircle className="mr-2 h-4 w-4" />
          Checked In
        </>
      ) : (
        "Check In"
      )}
    </Button>
  )
}

export default CheckInButton
