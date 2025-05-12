"use client"

import { useState, useEffect } from "react"
import { Loader2, MapPin, Check, AlertCircle, Download, ImageIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import { LocationSearch } from "@/components/admin/shop-import/location-search"
import { ShopTypeFilter } from "@/components/admin/shop-import/shop-type-filter"
import {
  searchIceCreamBusinesses,
  getPlaceDetails,
  convertPlaceToShop,
  isIceCreamShop,
} from "@/lib/services/google-places-service"
import { createClient } from "@/lib/supabase/client"

interface LocationData {
  address: string
  lat: number
  lng: number
  radius: number
}

interface FilterData {
  types: string[]
  keywords: string[]
  excludeKeywords: string[]
}

interface ShopResult {
  place_id: string
  name: string
  vicinity: string
  rating?: number
  user_ratings_total?: number
  types: string[]
  geometry: {
    location: {
      lat: number
      lng: number
    }
  }
  photos?: { photo_reference: string }[]
  matched_keywords?: string[]
  isDuplicate?: boolean
  isSelected?: boolean
  details?: any
}

export default function EnhancedShopImportPage() {
  const [location, setLocation] = useState<LocationData | null>(null)
  const [filters, setFilters] = useState<FilterData>({
    types: ["ice_cream_shop", "gelato", "frozen_yogurt"],
    keywords: ["ice cream", "gelato", "frozen yogurt", "soft serve", "sorbet"],
    excludeKeywords: ["convenience store", "grocery"],
  })

  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ShopResult[]>([])
  const [filteredResults, setFilteredResults] = useState<ShopResult[]>([])
  const [selectedShops, setSelectedShops] = useState<ShopResult[]>([])
  const [isImporting, setIsImporting] = useState(false)
  const [importProgress, setImportProgress] = useState(0)
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  })
  const [nextPageToken, setNextPageToken] = useState<string | undefined>()
  const [existingShops, setExistingShops] = useState<{ [key: string]: boolean }>({})

  const { toast } = useToast()

  // Fetch existing shops on component mount
  useEffect(() => {
    const fetchExistingShops = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("shops").select("googlePlaceId")

        if (error) throw error

        const shopMap: { [key: string]: boolean } = {}
        data?.forEach((shop) => {
          if (shop.googlePlaceId) {
            shopMap[shop.googlePlaceId] = true
          }
        })

        setExistingShops(shopMap)
      } catch (error) {
        console.error("Error fetching existing shops:", error)
      }
    }

    fetchExistingShops()
  }, [])

  // Handle location selection
  const handleLocationSelected = (locationData: LocationData) => {
    setLocation(locationData)
    setSearchResults([])
    setFilteredResults([])
    setSelectedShops([])
  }

  // Handle filter changes
  const handleFilterChange = (filterData: FilterData) => {
    setFilters(filterData)

    // Re-apply filters to existing results
    if (searchResults.length > 0) {
      applyFilters(searchResults, filterData)
    }
  }

  // Search for shops
  const searchShops = async () => {
    if (!location) return

    setIsSearching(true)
    setSearchResults([])
    setFilteredResults([])
    setSelectedShops([])

    try {
      const result = await searchIceCreamBusinesses(
        "ice cream",
        { lat: location.lat, lng: location.lng },
        location.radius,
        undefined,
      )

      // Mark duplicates
      const shops = result.results.map((shop) => ({
        ...shop,
        isDuplicate: !!existingShops[shop.place_id],
      }))

      setSearchResults(shops)
      setNextPageToken(result.nextPageToken)

      // Apply filters
      await applyFilters(shops, filters)

      toast({
        title: "Search complete",
        description: `Found ${result.results.length} potential shops`,
      })
    } catch (error) {
      console.error("Error searching for shops:", error)
      toast({
        title: "Search failed",
        description: "Failed to search for shops. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Load more results
  const loadMoreResults = async () => {
    if (!location || !nextPageToken) return

    setIsSearching(true)

    try {
      const result = await searchIceCreamBusinesses(
        "ice cream",
        { lat: location.lat, lng: location.lng },
        location.radius,
        nextPageToken,
      )

      // Mark duplicates
      const newShops = result.results.map((shop) => ({
        ...shop,
        isDuplicate: !!existingShops[shop.place_id],
      }))

      const allShops = [...searchResults, ...newShops]
      setSearchResults(allShops)
      setNextPageToken(result.nextPageToken)

      // Apply filters
      await applyFilters(allShops, filters)
    } catch (error) {
      console.error("Error loading more shops:", error)
      toast({
        title: "Failed to load more",
        description: "Could not load additional shops. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Apply filters to search results
  const applyFilters = async (shops: ShopResult[], currentFilters: FilterData) => {
    const { keywords, excludeKeywords } = currentFilters

    const filtered = []

    for (const shop of shops) {
      // Check if any shop details match our keywords
      const shopText = [shop.name, shop.vicinity, ...(shop.types || [])].join(" ").toLowerCase()

      // Check for matching keywords
      const matchedKeywords = keywords.filter((keyword) => shopText.includes(keyword.toLowerCase()))

      // Check for excluded keywords
      const hasExcludedKeyword = excludeKeywords.some((keyword) => shopText.includes(keyword.toLowerCase()))

      // Use the isIceCreamShop function to check if it's an ice cream shop
      const isIceCream = await isIceCreamShop(shop, keywords, excludeKeywords)

      // Store matched keywords for display
      shop.matched_keywords = matchedKeywords

      if ((matchedKeywords.length > 0 || isIceCream) && !hasExcludedKeyword) {
        filtered.push(shop)
      }
    }

    setFilteredResults(filtered)
  }

  // Toggle shop selection
  const toggleShopSelection = (shop: ShopResult) => {
    if (shop.isDuplicate) return // Don't allow selecting duplicates

    setFilteredResults((prev) =>
      prev.map((s) => (s.place_id === shop.place_id ? { ...s, isSelected: !s.isSelected } : s)),
    )

    if (selectedShops.some((s) => s.place_id === shop.place_id)) {
      setSelectedShops((prev) => prev.filter((s) => s.place_id !== shop.place_id))
    } else {
      setSelectedShops((prev) => [...prev, { ...shop, isSelected: true }])
    }
  }

  // Select all filtered shops
  const selectAllShops = () => {
    const nonDuplicates = filteredResults.filter((shop) => !shop.isDuplicate)

    setFilteredResults((prev) => prev.map((shop) => (shop.isDuplicate ? shop : { ...shop, isSelected: true })))

    setSelectedShops(nonDuplicates.map((shop) => ({ ...shop, isSelected: true })))
  }

  // Deselect all shops
  const deselectAllShops = () => {
    setFilteredResults((prev) => prev.map((shop) => ({ ...shop, isSelected: false })))

    setSelectedShops([])
  }

  // Import selected shops
  const importSelectedShops = async () => {
    if (selectedShops.length === 0) {
      toast({
        title: "No shops selected",
        description: "Please select at least one shop to import",
        variant: "destructive",
      })
      return
    }

    setIsImporting(true)
    setImportProgress(0)
    setImportStats({
      total: selectedShops.length,
      imported: 0,
      skipped: 0,
      failed: 0,
    })

    const supabase = createClient()

    for (let i = 0; i < selectedShops.length; i++) {
      const shop = selectedShops[i]

      try {
        // Get detailed information about the shop
        const detailsResult = await getPlaceDetails(shop.place_id)

        // Convert to our shop format
        const shopData = await convertPlaceToShop(detailsResult)

        // Insert into database
        const { data, error } = await supabase.from("shops").insert(shopData).select("id").single()

        if (error) {
          console.error("Error importing shop:", error)
          setImportStats((prev) => ({
            ...prev,
            failed: prev.failed + 1,
          }))
        } else {
          setImportStats((prev) => ({
            ...prev,
            imported: prev.imported + 1,
          }))

          // Add to existing shops to prevent duplicates
          setExistingShops((prev) => ({
            ...prev,
            [shop.place_id]: true,
          }))
        }
      } catch (error) {
        console.error(`Error importing shop ${shop.name}:`, error)
        setImportStats((prev) => ({
          ...prev,
          failed: prev.failed + 1,
        }))
      }

      // Update progress
      setImportProgress(Math.round(((i + 1) / selectedShops.length) * 100))
    }

    setIsImporting(false)

    toast({
      title: "Import complete",
      description: `Imported ${importStats.imported} shops successfully`,
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Enhanced Shop Import</h1>
        <p className="text-muted-foreground">Search and import ice cream shops from Google Places</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LocationSearch onLocationSelected={handleLocationSelected} />
        <ShopTypeFilter onFilterChange={handleFilterChange} />
      </div>

      {location && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              Searching within {location.radius / 1000}km of {location.address}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 && !isSearching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Button onClick={searchShops}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Start Search
                </Button>
              </div>
            ) : isSearching ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-4 text-center text-muted-foreground">Searching for ice cream shops...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm">
                      Found <span className="font-medium">{searchResults.length}</span> shops,
                      <span className="font-medium"> {filteredResults.length}</span> match your filters
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllShops}
                      disabled={filteredResults.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={deselectAllShops}
                      disabled={selectedShops.length === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                <div className="border rounded-md">
                  <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-3 font-medium border-b bg-muted/50">
                    <div className="w-8"></div>
                    <div>Shop Details</div>
                    <div className="w-20 text-right">Rating</div>
                  </div>

                  <div className="max-h-[400px] overflow-y-auto">
                    {filteredResults.length > 0 ? (
                      filteredResults.map((shop) => (
                        <div
                          key={shop.place_id}
                          className={`grid grid-cols-[auto_80px_1fr_auto] gap-4 p-3 border-b last:border-0 hover:bg-muted/50 ${
                            shop.isDuplicate ? "opacity-50" : ""
                          }`}
                          onClick={() => !shop.isDuplicate && toggleShopSelection(shop)}
                        >
                          <div className="flex items-center justify-center w-8">
                            {shop.isDuplicate ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                                <AlertCircle className="h-4 w-4" />
                              </span>
                            ) : shop.isSelected ? (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                <Check className="h-4 w-4" />
                              </span>
                            ) : (
                              <span className="flex h-6 w-6 items-center justify-center rounded-full border border-muted-foreground/30"></span>
                            )}
                          </div>

                          {/* Shop Image */}
                          <div className="w-20 h-20 relative rounded-md overflow-hidden">
                            {shop.photos && shop.photos.length > 0 ? (
                              <img
                                src={`/api/maps/photo?reference=${shop.photos[0].photo_reference}&maxwidth=200`}
                                alt={shop.name}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  e.currentTarget.src = "/colorful-ice-cream-shop.png"
                                }}
                              />
                            ) : (
                              <div className="w-full h-full bg-muted flex items-center justify-center text-muted-foreground">
                                <ImageIcon className="h-8 w-8" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="font-medium">{shop.name}</div>
                            <div className="text-sm text-muted-foreground">{shop.vicinity}</div>
                            {shop.matched_keywords && shop.matched_keywords.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {shop.matched_keywords.map((keyword) => (
                                  <span
                                    key={keyword}
                                    className="px-1.5 py-0.5 bg-primary/10 text-primary text-xs rounded"
                                  >
                                    {keyword}
                                  </span>
                                ))}
                              </div>
                            )}
                            {shop.isDuplicate && (
                              <div className="text-xs text-yellow-600 mt-1">Already in database</div>
                            )}
                          </div>
                          <div className="text-right">
                            {shop.rating ? (
                              <div className="flex items-center justify-end">
                                <span className="font-medium">{shop.rating}</span>
                                <span className="text-yellow-500 ml-1">★</span>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No rating</span>
                            )}
                            {shop.user_ratings_total && (
                              <div className="text-xs text-muted-foreground">{shop.user_ratings_total} reviews</div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-muted-foreground">No shops match your current filters</div>
                    )}
                  </div>
                </div>

                {nextPageToken && (
                  <div className="flex justify-center">
                    <Button variant="outline" onClick={loadMoreResults} disabled={isSearching}>
                      {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Load More Results
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
          {filteredResults.length > 0 && (
            <CardFooter className="flex justify-between">
              <div>
                <span className="text-sm font-medium">{selectedShops.length} shops selected</span>
              </div>
              <Button onClick={importSelectedShops} disabled={selectedShops.length === 0 || isImporting}>
                {isImporting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Import Selected Shops
                  </>
                )}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {isImporting && (
        <Card>
          <CardHeader>
            <CardTitle>Import Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={importProgress} />
            <div className="grid grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">{importStats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{importStats.imported}</div>
                <div className="text-xs text-muted-foreground">Imported</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600">{importStats.skipped}</div>
                <div className="text-xs text-muted-foreground">Skipped</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{importStats.failed}</div>
                <div className="text-xs text-muted-foreground">Failed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
