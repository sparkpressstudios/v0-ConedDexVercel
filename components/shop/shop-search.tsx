"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Store, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { createClient } from "@/lib/supabase/client"
import { useDebounce } from "@/hooks/use-debounce"
import { geocodeAddress } from "@/lib/services/location-service"

interface ShopSearchProps {
  onSelect?: (shop: any) => void
  placeholder?: string
  includeLocation?: boolean
  className?: string
}

export function ShopSearch({
  onSelect,
  placeholder = "Search for shops...",
  includeLocation = true,
  className,
}: ShopSearchProps) {
  const [open, setOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<any[]>([])
  const [locationResults, setLocationResults] = useState<any[]>([])
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const supabase = createClient()
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)

  // Search for shops when the debounced search term changes
  useEffect(() => {
    const searchShops = async () => {
      if (!debouncedSearchTerm || debouncedSearchTerm.length < 2) {
        setResults([])
        setLocationResults([])
        return
      }

      setIsSearching(true)

      try {
        // Search shops in the database
        const { data, error } = await supabase
          .from("shops")
          .select("id, name, address, city, state, country, latitude, longitude, image_url")
          .or(`name.ilike.%${debouncedSearchTerm}%, address.ilike.%${debouncedSearchTerm}%`)
          .limit(5)

        if (error) {
          console.error("Error searching shops:", error)
        } else {
          setResults(data || [])
        }

        // If location search is enabled, also search for locations
        if (includeLocation) {
          try {
            const locationData = await geocodeAddress(debouncedSearchTerm)
            if (locationData) {
              setLocationResults([
                {
                  id: "location",
                  name: debouncedSearchTerm,
                  latitude: locationData.lat,
                  longitude: locationData.lng,
                  isLocation: true,
                },
              ])
            }
          } catch (err) {
            console.error("Error geocoding address:", err)
            setLocationResults([])
          }
        }
      } catch (err) {
        console.error("Error searching:", err)
      } finally {
        setIsSearching(false)
      }
    }

    searchShops()
  }, [debouncedSearchTerm, supabase, includeLocation])

  const handleSelect = (item: any) => {
    setOpen(false)

    if (item.isLocation) {
      // Handle location selection
      if (onSelect) {
        onSelect({
          latitude: item.latitude,
          longitude: item.longitude,
          address: item.name,
          isLocation: true,
        })
      } else {
        router.push(
          `/dashboard/shops/map?lat=${item.latitude}&lng=${item.longitude}&q=${encodeURIComponent(item.name)}`,
        )
      }
    } else {
      // Handle shop selection
      if (onSelect) {
        onSelect(item)
      } else {
        router.push(`/dashboard/shops/${item.id}`)
      }
    }
  }

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={inputRef}
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              onFocus={() => setOpen(true)}
            />
            {isSearching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start" sideOffset={5}>
          <Command>
            <CommandList>
              <CommandEmpty>No results found</CommandEmpty>
              {results.length > 0 && (
                <CommandGroup heading="Shops">
                  {results.map((shop) => (
                    <CommandItem
                      key={shop.id}
                      value={shop.name}
                      onSelect={() => handleSelect(shop)}
                      className="flex items-center gap-2 py-2"
                    >
                      <Store className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span className="font-medium">{shop.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {[shop.address, shop.city, shop.state].filter(Boolean).join(", ")}
                        </span>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
              {locationResults.length > 0 && (
                <CommandGroup heading="Locations">
                  {locationResults.map((location) => (
                    <CommandItem
                      key={location.id}
                      value={location.name}
                      onSelect={() => handleSelect(location)}
                      className="flex items-center gap-2 py-2"
                    >
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{location.name}</span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  )
}
