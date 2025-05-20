"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, ThumbsUp, Flag } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"

interface ShopReviewsListProps {
  shopId: string
}

export function ShopReviewsList({ shopId }: ShopReviewsListProps) {
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const supabase = createClient()
  const { toast } = useToast()
  const { user } = useAuth()

  const pageSize = 5

  // Fetch reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from("shop_reviews")
          .select(`
            id,
            rating,
            comment,
            created_at,
            user_id,
            profiles(id, username, full_name, avatar_url)
          `)
          .eq("shop_id", shopId)
          .order("created_at", { ascending: false })
          .range(page * pageSize, (page + 1) * pageSize - 1)

        if (error) throw error

        if (data.length < pageSize) {
          setHasMore(false)
        }

        if (page === 0) {
          setReviews(data || [])
        } else {
          setReviews((prev) => [...prev, ...(data || [])])
        }
      } catch (error) {
        console.error("Error fetching reviews:", error)
        toast({
          title: "Failed to load reviews",
          description: "There was an error loading the reviews. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [shopId, page, supabase, toast])

  // Load more reviews
  const loadMoreReviews = () => {
    setPage((prev) => prev + 1)
  }

  // Like a review
  const handleLikeReview = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to like reviews",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("review_likes").insert({
        review_id: reviewId,
        user_id: user.id,
      })

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          toast({
            title: "Already liked",
            description: "You have already liked this review",
          })
        } else {
          throw error
        }
      } else {
        // Update the UI to show the like
        setReviews(
          reviews.map((review) => {
            if (review.id === reviewId) {
              return {
                ...review,
                likes_count: (review.likes_count || 0) + 1,
                user_has_liked: true,
              }
            }
            return review
          }),
        )

        toast({
          title: "Review liked",
          description: "You have liked this review",
        })
      }
    } catch (error) {
      console.error("Error liking review:", error)
      toast({
        title: "Failed to like review",
        description: "There was an error liking the review. Please try again.",
        variant: "destructive",
      })
    }
  }

  // Report a review
  const handleReportReview = async (reviewId: string) => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please log in to report reviews",
        variant: "destructive",
      })
      return
    }

    try {
      const { error } = await supabase.from("review_reports").insert({
        review_id: reviewId,
        user_id: user.id,
        reason: "inappropriate",
      })

      if (error) {
        if (error.code === "23505") {
          // Unique violation
          toast({
            title: "Already reported",
            description: "You have already reported this review",
          })
        } else {
          throw error
        }
      } else {
        toast({
          title: "Review reported",
          description: "Thank you for reporting this review. Our team will review it.",
        })
      }
    } catch (error) {
      console.error("Error reporting review:", error)
      toast({
        title: "Failed to report review",
        description: "There was an error reporting the review. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading && page === 0) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-gray-200"></div>
                <div className="space-y-1">
                  <div className="h-4 w-24 bg-gray-200 rounded"></div>
                  <div className="h-3 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded"></div>
                <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p className="text-muted-foreground">No reviews yet for this shop.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Avatar>
                  <AvatarImage
                    src={review.profiles?.avatar_url || "/placeholder.svg"}
                    alt={review.profiles?.username || "User"}
                  />
                  <AvatarFallback>{(review.profiles?.username || "U").substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{review.profiles?.username || "Anonymous"}</p>
                  <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                  />
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm">{review.comment}</p>
            <div className="mt-4 flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleLikeReview(review.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <ThumbsUp className="mr-1 h-4 w-4" />
                <span>{review.likes_count || 0}</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleReportReview(review.id)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Flag className="mr-1 h-4 w-4" />
                <span>Report</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {hasMore && (
        <div className="flex justify-center">
          <Button variant="outline" onClick={loadMoreReviews} disabled={loading}>
            {loading ? "Loading..." : "Load More Reviews"}
          </Button>
        </div>
      )}
    </div>
  )
}
