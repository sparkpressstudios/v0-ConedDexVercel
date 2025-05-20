"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

interface ShopFiltersProps {
  onApplyFilters?: (filters: any) => void
}

// Named export
export function ShopFilters({ onApplyFilters }: ShopFiltersProps) {
  const [rating, setRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [hasSpecials, setHasSpecials] = useState(false)
  const [sortBy, setSortBy] = useState("popular")

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        rating,
        verifiedOnly,
        hasSpecials,
        sortBy,
      })
    }
  }

  const resetFilters = () => {
    setRating(0)
    setVerifiedOnly(false)
    setHasSpecials(false)
    setSortBy("popular")

    if (onApplyFilters) {
      onApplyFilters({
        rating: 0,
        verifiedOnly: false,
        hasSpecials: false,
        sortBy: "popular",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Minimum Rating</h3>
        <div className="space-y-2">
          <RadioGroup value={rating.toString()} onValueChange={(value) => setRating(Number(value))}>
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
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Sort By</h3>
        <RadioGroup value={sortBy} onValueChange={setSortBy}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="popular" id="sort-popular" />
            <Label htmlFor="sort-popular">Most Popular</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="rating" id="sort-rating" />
            <Label htmlFor="sort-rating">Highest Rated</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="newest" id="sort-newest" />
            <Label htmlFor="sort-newest">Newest Added</Label>
          </div>
        </RadioGroup>
      </div>

      <Separator />

      <div className="space-y-3">
        <h3 className="text-sm font-medium">Options</h3>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="verified-only" className="flex-1">
              Verified shops only
            </Label>
            <Switch id="verified-only" checked={verifiedOnly} onCheckedChange={setVerifiedOnly} />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="has-specials" className="flex-1">
              Has seasonal specials
            </Label>
            <Switch id="has-specials" checked={hasSpecials} onCheckedChange={setHasSpecials} />
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="outline" onClick={resetFilters}>
          Reset
        </Button>
        <Button onClick={handleApplyFilters}>Apply Filters</Button>
      </div>
    </div>
  )
}

// Default export (same component)
export default ShopFilters
