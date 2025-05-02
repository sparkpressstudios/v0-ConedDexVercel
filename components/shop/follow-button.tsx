"use client"

import { useState, useEffect } from "react"
import { Heart, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface FollowButtonProps {
  shopId: string
  initialFollowed?: boolean
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg" | "icon"
  showCount?: boolean
}

export function FollowButton({
  shopId,
  initialFollowed = false,
  variant = "outline",
  size = "default",
  showCount = false,
}: FollowButtonProps) {
  const { user } = useAuth()
  const supabase = createClient()
  const { toast } = useToast()

  const [isFollowed, setIsFollowed] = useState(initialFollowed)
  const [isLoading, setIsLoading] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  useEffect(() => {
    // Check if user is following this shop
    const checkFollowStatus = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from("shop_followers")
          .select("*")
          .eq("shop_id", shopId)
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error checking follow status:", error)
          return
        }

        setIsFollowed(!!data)
      } catch (error) {
        console.error("Error checking follow status:", error)
      }
    }

    // Get follower count
    const getFollowerCount = async () => {
      try {
        const { count, error } = await supabase
          .from("shop_followers")
          .select("*", { count: "exact", head: true })
          .eq("shop_id", shopId)

        if (error) {
          console.error("Error getting follower count:", error)
          return
        }

        setFollowerCount(count || 0)
      } catch (error) {
        console.error("Error getting follower count:", error)
      }
    }

    checkFollowStatus()
    if (showCount) {
      getFollowerCount()
    }
  }, [user, shopId, supabase, showCount])

  const handleFollow = async () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to follow shops",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      if (isFollowed) {
        // Unfollow
        const { error } = await supabase.from("shop_followers").delete().eq("shop_id", shopId).eq("user_id", user.id)

        if (error) throw error

        setIsFollowed(false)
        if (showCount) setFollowerCount((prev) => Math.max(0, prev - 1))

        toast({
          title: "Shop unfollowed",
          description: "You will no longer receive updates from this shop",
        })
      } else {
        // Follow
        const { error } = await supabase.from("shop_followers").insert({
          shop_id: shopId,
          user_id: user.id,
        })

        if (error) throw error

        setIsFollowed(true)
        if (showCount) setFollowerCount((prev) => prev + 1)

        toast({
          title: "Shop followed",
          description: "You will now receive updates from this shop",
        })
      }
    } catch (error) {
      console.error("Error following/unfollowing shop:", error)
      toast({
        title: "Error",
        description: "Failed to update follow status",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={variant}
        size={size}
        onClick={handleFollow}
        disabled={isLoading}
        className={isFollowed ? "bg-pink-100 text-pink-600 hover:bg-pink-200 hover:text-pink-700 border-pink-200" : ""}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Heart className={`h-4 w-4 ${isFollowed ? "fill-pink-600 text-pink-600" : ""}`} />
        )}
        {size !== "icon" && <span className="ml-1">{isFollowed ? "Following" : "Follow"}</span>}
      </Button>
      {showCount && (
        <span className="text-sm text-muted-foreground">
          {followerCount} {followerCount === 1 ? "follower" : "followers"}
        </span>
      )}
    </div>
  )
}
