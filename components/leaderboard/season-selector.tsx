"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "lucide-react"

interface SeasonSelectorProps {
  seasons: Array<{
    id: string
    name: string
    description: string
    start_date: string
    end_date: string
    is_active: boolean
  }>
  selectedSeason: string | null
  onSelectSeason: (seasonId: string) => void
}

export function SeasonSelector({ seasons, selectedSeason, onSelectSeason }: SeasonSelectorProps) {
  if (!seasons || seasons.length === 0) {
    return null
  }

  return (
    <Select value={selectedSeason || undefined} onValueChange={onSelectSeason}>
      <SelectTrigger className="w-full sm:w-[200px]">
        <SelectValue placeholder="Select season" />
      </SelectTrigger>
      <SelectContent>
        {seasons.map((season) => (
          <SelectItem key={season.id} value={season.id}>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>
                {season.name}
                {season.is_active && " (Current)"}
              </span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
