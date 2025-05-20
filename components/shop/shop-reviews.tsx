"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star, MessageSquare } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShopReviewsList } from "./shop-reviews-list"

interface ShopReviewsProps {
  shopId: string
  shopName: string
}

export default function ShopReviews({ shopId, shopName }: ShopReviewsProps) {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(5)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useAuth()

  // Submit review
  const handleSubmitReview = async () => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to leave a review",
        variant: "destructive",
      })
      return
    }

    if (!reviewText.trim()) {
      toast({
        title: "Review required",
        description: "Please enter a review comment",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("shop_reviews").insert({
        shop_id: shopId,
        user_id: user.id,
        rating,
        comment: reviewText,
      })

      if (error) throw error

      toast({
        title: "Review submitted",
        description: "Your review has been submitted successfully",
      })

      // Reset form
      setReviewText("")
      setRating(5)
      setIsReviewModalOpen(false)

      // Force a refresh to show the new review
      window.location.reload()
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Failed to submit review",
        description: "There was an error submitting your review. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Customer Reviews</h2>
        <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
          <DialogTrigger asChild>
            <Button>
              <MessageSquare className="mr-2 h-4 w-4" />
              Write a Review
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Review {shopName}</DialogTitle>
              <DialogDescription>
                Share your experience with this shop. Your review will help others discover great ice cream!
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Rating</Label>
                <RadioGroup
                  value={rating.toString()}
                  onValueChange={(value) => setRating(Number.parseInt(value))}
                  className="flex space-x-1"
                >
                  {[1, 2, 3, 4, 5].map((value) => (
                    <div key={value} className="flex flex-col items-center">
                      <RadioGroupItem value={value.toString()} id={`rating-${value}`} className="sr-only" />
                      <Label
                        htmlFor={`rating-${value}`}
                        className={`cursor-pointer rounded-full p-1 ${
                          rating >= value ? "text-yellow-400" : "text-gray-300"
                        }`}
                      >
                        <Star className={`h-8 w-8 ${rating >= value ? "fill-yellow-400" : ""}`} />
                      </Label>
                      <span className="text-xs">{value}</span>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="review">Your Review</Label>
                <Textarea
                  id="review"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this shop..."
                  rows={5}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsReviewModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSubmitReview} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ShopReviewsList shopId={shopId} />
    </div>
  )
}
