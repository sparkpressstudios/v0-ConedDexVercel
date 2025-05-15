"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"

// Add named export alongside default export
export function ShopFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [verified, setVerified] = useState(searchParams.get("verified") === "true")
  const [rating, setRating] = useState(Number.parseInt(searchParams.get("rating") || "0"))
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "popular")
  const [hasSpecials, setHasSpecials] = useState(searchParams.get("specials") === "true")
  const [distance, setDistance] = useState(Number.parseInt(searchParams.get("distance") || "25"))

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString())

    if (verified) {
      params.set("verified", "true")
    } else {
      params.delete("verified")
    }

    if (rating > 0) {
      params.set("rating", rating.toString())
    } else {
      params.delete("rating")
    }

    params.set("sort", sortBy)

    if (hasSpecials) {
      params.set("specials", "true")
    } else {
      params.delete("specials")
    }

    params.set("distance", distance.toString())

    router.push(`/shops?${params.toString()}`)
  }

  const resetFilters = () => {
    const params = new URLSearchParams()
    const view = searchParams.get("view")
    const q = searchParams.get("q")

    if (view) {
      params.set("view", view)
    }

    if (q) {
      params.set("q", q)
    }

    setVerified(false)
    setRating(0)
    setSortBy("popular")
    setHasSpecials(false)
    setDistance(25)

    router.push(`/shops?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-medium">Verification Status</h3>
        <div className="flex items-center space-x-2">
          <Checkbox id="verified" checked={verified} onCheckedChange={(checked) => setVerified(checked as boolean)} />
          <Label htmlFor="verified">Show verified shops only</Label>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Minimum Rating</h3>
        <RadioGroup value={rating.toString()} onValueChange={(value) => setRating(Number.parseInt(value))}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="0" id="rating-any" />
            <Label htmlFor="rating-any">Any rating</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="3" id="rating-3" />
            <Label htmlFor="rating-3">3+ stars</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="4" id="rating-4" />
            <Label htmlFor="rating-4">4+ stars</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="5" id="rating-5" />
            <Label htmlFor="rating-5">5 stars only</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Sort By</h3>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="popular" id="sort-popular" />
            <Label htmlFor="sort-popular">Most Popular (Check-ins)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rating" id="sort-rating" />
            <Label htmlFor="sort-rating">Highest Rated</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest">Newest Added</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="name" id="sort-name" />
            <Label htmlFor="sort-name">Alphabetical</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Features</h3>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="specials"
            checked={hasSpecials}
            onCheckedChange={(checked) => setHasSpecials(checked as boolean)}
          />
          <Label htmlFor="specials">Has seasonal specials</Label>
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium">Maximum Distance</h3>
          <span className="text-sm text-muted-foreground">{distance} miles</span>
        </div>
        <Slider value={[distance]} min={5} max={50} step={5} onValueChange={(values) => setDistance(values[0])} />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>5 mi</span>
          <span>25 mi</span>
          <span>50 mi</span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={applyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}

// Keep default export for backward compatibility
export default ShopFilters
