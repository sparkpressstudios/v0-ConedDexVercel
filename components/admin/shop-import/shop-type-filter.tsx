"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"

// Ice cream related business types
const shopTypes = [
  { value: "ice_cream_shop", label: "Ice Cream Shop" },
  { value: "gelato", label: "Gelato Shop" },
  { value: "frozen_yogurt", label: "Frozen Yogurt" },
  { value: "dessert", label: "Dessert Shop" },
  { value: "cafe", label: "Café with Ice Cream" },
  { value: "bakery", label: "Bakery with Ice Cream" },
  { value: "restaurant", label: "Restaurant with Ice Cream" },
  { value: "food_truck", label: "Ice Cream Truck/Stand" },
  { value: "convenience_store", label: "Store with Ice Cream" },
  { value: "supermarket", label: "Supermarket" },
]

// Keywords for filtering
const defaultKeywords = [
  "ice cream",
  "gelato",
  "frozen yogurt",
  "soft serve",
  "sorbet",
  "frozen dessert",
  "scoop",
  "cone",
  "sundae",
]

interface ShopTypeFilterProps {
  onFilterChange: (filters: {
    types: string[]
    keywords: string[]
    excludeKeywords: string[]
  }) => void
}

export function ShopTypeFilter({ onFilterChange }: ShopTypeFilterProps) {
  const [selectedTypes, setSelectedTypes] = useState<string[]>(["ice_cream_shop", "gelato", "frozen_yogurt"])
  const [keywords, setKeywords] = useState<string[]>(defaultKeywords)
  const [excludeKeywords, setExcludeKeywords] = useState<string[]>(["convenience store", "grocery"])
  const [keywordInput, setKeywordInput] = useState("")
  const [excludeInput, setExcludeInput] = useState("")
  const [open, setOpen] = useState(false)

  const handleTypeSelect = (value: string) => {
    const updated = selectedTypes.includes(value) ? selectedTypes.filter((t) => t !== value) : [...selectedTypes, value]

    setSelectedTypes(updated)
    triggerFilterChange(updated, keywords, excludeKeywords)
  }

  const addKeyword = () => {
    if (keywordInput.trim() && !keywords.includes(keywordInput.trim())) {
      const updated = [...keywords, keywordInput.trim()]
      setKeywords(updated)
      setKeywordInput("")
      triggerFilterChange(selectedTypes, updated, excludeKeywords)
    }
  }

  const removeKeyword = (keyword: string) => {
    const updated = keywords.filter((k) => k !== keyword)
    setKeywords(updated)
    triggerFilterChange(selectedTypes, updated, excludeKeywords)
  }

  const addExcludeKeyword = () => {
    if (excludeInput.trim() && !excludeKeywords.includes(excludeInput.trim())) {
      const updated = [...excludeKeywords, excludeInput.trim()]
      setExcludeKeywords(updated)
      setExcludeInput("")
      triggerFilterChange(selectedTypes, keywords, updated)
    }
  }

  const removeExcludeKeyword = (keyword: string) => {
    const updated = excludeKeywords.filter((k) => k !== keyword)
    setExcludeKeywords(updated)
    triggerFilterChange(selectedTypes, keywords, updated)
  }

  const triggerFilterChange = (types: string[], kw: string[], exclude: string[]) => {
    onFilterChange({
      types,
      keywords: kw,
      excludeKeywords: exclude,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Business Types</label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
                {selectedTypes.length > 0 ? `${selectedTypes.length} types selected` : "Select business types..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Search business types..." />
                <CommandList>
                  <CommandEmpty>No business type found.</CommandEmpty>
                  <CommandGroup>
                    {shopTypes.map((type) => (
                      <CommandItem key={type.value} value={type.value} onSelect={() => handleTypeSelect(type.value)}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedTypes.includes(type.value) ? "opacity-100" : "opacity-0",
                          )}
                        />
                        {type.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Include Keywords</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add keyword..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addKeyword())}
            />
            <Button type="button" onClick={addKeyword} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {keywords.map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
                <button className="ml-1 rounded-full outline-none focus:ring-2" onClick={() => removeKeyword(keyword)}>
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Exclude Keywords</label>
          <div className="flex gap-2">
            <Input
              placeholder="Add exclusion keyword..."
              value={excludeInput}
              onChange={(e) => setExcludeInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addExcludeKeyword())}
            />
            <Button type="button" onClick={addExcludeKeyword} variant="outline">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {excludeKeywords.map((keyword) => (
              <Badge key={keyword} variant="destructive" className="text-xs">
                {keyword}
                <button
                  className="ml-1 rounded-full outline-none focus:ring-2"
                  onClick={() => removeExcludeKeyword(keyword)}
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
