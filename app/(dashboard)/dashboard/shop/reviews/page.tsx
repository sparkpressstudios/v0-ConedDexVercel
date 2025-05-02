"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, Search, Filter, ArrowUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Skeleton } from "@/components/ui/skeleton"

export default function ShopReviewsPage() {
  const router = useRouter()
  const { user } = useAuth()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<string>("recent")
  const [ratingFilter, setRatingFilter] = useState<number[]>([])
  const [shop, setShop] = useState<any | null>(null)

  useEffect(() => {
    const fetchReviewData = async () => {
      if (!user) return

      setLoading(true)
      try {
        // Get the shop
        const { data: shopData, error: shopError } = await supabase
          .from("shops")
          .select("*")
          .eq("owner_id", user.id)
          .single()

        if (shopError) {
          if (shopError.code === "PGRST116") {
            // No shop found, redirect to claim page
            router.push("/dashboard/shop/claim")
            return
          }
          throw shopError
        }

        setShop(shopData)

        // Get reviews for this shop
        const { data: reviewData, error: reviewError } = await supabase
          .from("flavor_logs")
          .select(`
            id,
            created_at,
            rating,
            review,
            flavors:flavor_id (
              id,
              name,
              base_type
            ),
            profiles:user_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `)
          .eq("shop_id", shopData.id)
          .not("review", "is", null)
          .order("created_at", { ascending: false })

        if (reviewError) throw reviewError

        setReviews(reviewData || [])
      } catch (error) {
        console.error("Error fetching review data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviewData()
  }, [user, supabase, router])

  // Filter reviews based on search query and rating filter
  const filteredReviews = reviews.filter((review) => {
    const reviewText = review.review?.toLowerCase() || ""
    const flavorName = review.flavors?.name?.toLowerCase() || ""
    const username = review.profiles?.username?.toLowerCase() || ""
    const fullName = review.profiles?.full_name?.toLowerCase() || ""

    const matchesSearch =
      reviewText.includes(searchQuery.toLowerCase()) ||
      flavorName.includes(searchQuery.toLowerCase()) ||
      username.includes(searchQuery.toLowerCase()) ||
      fullName.includes(searchQuery.toLowerCase())

    const matchesRating = ratingFilter.length === 0 || ratingFilter.includes(Math.round(review.rating || 0))

    return matchesSearch && matchesRating
  })

  // Sort reviews based on selected sort option
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    switch (sortBy) {
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "oldest":
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
      case "highest_rating":
        return (b.rating || 0) - (a.rating || 0)
      case "lowest_rating":
        return (a.rating || 0) - (b.rating || 0)
      default:
        return 0
    }
  })

  // Format date to readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Toggle rating filter
  const toggleRatingFilter = (rating: number) => {
    setRatingFilter((current) => {
      if (current.includes(rating)) {
        return current.filter((r) => r !== rating)
      } else {
        return [...current, rating]
      }
    })
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!shop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>No Shop Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You haven't claimed or created a shop yet.</p>
          </CardContent>
          <CardContent>
            <Button onClick={() => router.push("/dashboard/shop/claim")} className="w-full">
              Claim or Create Shop
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reviews</h1>
          <p className="text-muted-foreground">
            {reviews.length} {reviews.length === 1 ? "review" : "reviews"} for your shop
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search reviews..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {ratingFilter.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {ratingFilter.length}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => toggleRatingFilter(5)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter.includes(5)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleRatingFilter(4)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter.includes(4)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex items-center">
                    {[1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    <svg className="h-4 w-4 text-gray-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleRatingFilter(3)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter.includes(3)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex items-center">
                    {[1, 2, 3].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    {[1, 2].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 text-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleRatingFilter(2)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter.includes(2)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex items-center">
                    {[1, 2].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 fill-amber-400 text-amber-400"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                    {[1, 2, 3].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 text-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleRatingFilter(1)}>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={ratingFilter.includes(1)}
                    onChange={() => {}}
                    className="mr-2 h-4 w-4"
                  />
                  <div className="flex items-center">
                    <svg
                      className="h-4 w-4 fill-amber-400 text-amber-400"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                    </svg>
                    {[1, 2, 3, 4].map((star) => (
                      <svg
                        key={star}
                        className="h-4 w-4 text-gray-300"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRatingFilter([])}>Clear filters</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <ArrowUpDown className="mr-2 h-4 w-4" />
                Sort by:{" "}
                {sortBy === "recent"
                  ? "Most Recent"
                  : sortBy === "oldest"
                    ? "Oldest First"
                    : sortBy === "highest_rating"
                      ? "Highest Rating"
                      : "Lowest Rating"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onClick={() => setSortBy("recent")}>Most Recent</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("oldest")}>Oldest First</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("highest_rating")}>Highest Rating</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy("lowest_rating")}>Lowest Rating</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {sortedReviews.length === 0 ? (
        <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed text-center">
          <MessageSquare className="mb-2 h-8 w-8 text-muted-foreground" />
          {searchQuery || ratingFilter.length > 0 ? (
            <>
              <p className="text-muted-foreground">No reviews match your filters</p>
              <Button
                variant="link"
                onClick={() => {
                  setSearchQuery("")
                  setRatingFilter([])
                }}
              >
                Clear filters
              </Button>
            </>
          ) : (
            <p className="text-muted-foreground">No reviews for your shop yet</p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {sortedReviews.map((review) => (
            <Card key={review.id}>
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-full bg-muted">
                      {review.profiles?.avatar_url ? (
                        <img
                          src={review.profiles.avatar_url || "/placeholder.svg"}
                          alt={review.profiles.full_name || review.profiles.username}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground">
                          {(review.profiles?.full_name || review.profiles?.username || "U")[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {review.profiles?.full_name || review.profiles?.username || "Anonymous User"}
                      </div>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <span>{formatDate(review.created_at)}</span>
                        {review.flavors && (
                          <>
                            <span className="mx-1">•</span>
                            <span>{review.flavors.name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className={`h-4 w-4 ${
                          star <= Math.round(review.rating || 0) ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                      </svg>
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p>{review.review}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
