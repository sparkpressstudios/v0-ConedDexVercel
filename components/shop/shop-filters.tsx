"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"

interface ShopFiltersProps {
  onApplyFilters?: (filters: any) => void
}

export function ShopFilters({ onApplyFilters }: ShopFiltersProps) {
  const [rating, setRating] = useState(0)
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [hasSpecials, setHasSpecials] = useState(false)

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters({
        rating,
        verifiedOnly,
        hasSpecials,
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Rating</h3>
        <div className="space-y-2">
          <Slider defaultValue={[0]} max={5} step={1} value={[rating]} onValueChange={(value) => setRating(value[0])} />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Any</span>
            <span>{rating} stars+</span>
          </div>
        </div>
      </div>

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

      <Button onClick={handleApplyFilters} className="w-full">
        Apply Filters
      </Button>
    </div>
  )
}

export default ShopFilters
