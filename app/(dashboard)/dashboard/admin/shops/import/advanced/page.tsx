"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, Check, AlertCircle, Download, ImageIcon, RefreshCw, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import {
  searchForShops,
  batchImportShops,
  importTopShopsInCities,
  refreshAllShops,
  type ImportOptions,
} from "@/app/actions/enhanced-shop-import"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"

interface ShopResult {
  place_id: string
  name: string
  vicinity?: string
  formatted_address?: string
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
  isDuplicate?: boolean
  isSelected?: boolean
}

export default function AdvancedShopImportPage() {
  // State for the active tab
  const [activeTab, setActiveTab] = useState("search")

  // State for search parameters
  const [searchQuery, setSearchQuery] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [searchRadius, setSearchRadius] = useState(5)
  const [searchResults, setSearchResults] = useState<ShopResult[]>([])
  const [selectedShops, setSelectedShops] = useState<ShopResult[]>([])
  const [isSearching, setIsSearching] = useState(false)

  // State for batch import
  const [batchCities, setBatchCities] = useState("")
  const [maxPerCity, setMaxPerCity] = useState(5)
  const [isBatchImporting, setIsBatchImporting] = useState(false)

  // State for import options
  const [importOptions, setImportOptions] = useState<ImportOptions>({
    validateBeforeImport: true,
    skipExisting: true,
    updateExisting: false,
    importPhotos: true,
    maxResults: 10,
  })

  // State for import progress
  const [importProgress, setImportProgress] = useState(0)
  const [importStats, setImportStats] = useState({
    total: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
  })

  // State for refresh
  const [isRefreshing, setIsRefreshing] = useState(false)

  const { toast } = useToast()

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!searchQuery && !searchAddress) {
      toast({
        title: "Search parameters required",
        description: "Please enter either a search query or location",
        variant: "destructive",
      })
      return
    }

    setIsSearching(true)
    setSearchResults([])
    setSelectedShops([])

    try {
      const searchParams = searchQuery
        ? { query: searchQuery }
        : {
            location: {
              address: searchAddress,
            },
            radius: searchRadius * 1000, // Convert km to meters
          }

      const { results } = await searchForShops(searchParams)

      setSearchResults(results)

      toast({
        title: "Search complete",
        description: `Found ${results.length} potential shops`,
      })
    } catch (error) {
      console.error("Error searching for shops:", error)
      toast({
        title: "Search failed",
        description: error.message || "Failed to search for shops",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Toggle shop selection
  const toggleShopSelection = (shop: ShopResult) => {
    setSearchResults((prev) =>
      prev.map((s) => (s.place_id === shop.place_id ? { ...s, isSelected: !s.isSelected } : s)),
    )

    if (selectedShops.some((s) => s.place_id === shop.place_id)) {
      setSelectedShops((prev) => prev.filter((s) => s.place_id !== shop.place_id))
    } else {
      setSelectedShops((prev) => [...prev, { ...shop, isSelected: true }])
    }
  }

  // Select all shops
  const selectAllShops = () => {
    setSearchResults((prev) => prev.map((shop) => ({ ...shop, isSelected: true })))
    setSelectedShops(searchResults)
  }

  // Deselect all shops
  const deselectAllShops = () => {
    setSearchResults((prev) => prev.map((shop) => ({ ...shop, isSelected: false })))
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

    setImportProgress(0)
    setImportStats({
      total: selectedShops.length,
      imported: 0,
      skipped: 0,
      failed: 0,
    })

    try {
      // Extract place IDs
      const placeIds = selectedShops.map((shop) => shop.place_id)

      // Start import
      const result = await batchImportShops(placeIds, importOptions)

      // Update stats
      setImportStats({
        total: placeIds.length,
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
      })

      // Set progress to 100%
      setImportProgress(100)

      toast({
        title: "Import complete",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })

      // If successful, clear selections
      if (result.success) {
        setSelectedShops([])
        setSearchResults((prev) => prev.map((shop) => ({ ...shop, isSelected: false })))
      }
    } catch (error) {
      console.error("Error importing shops:", error)
      toast({
        title: "Import failed",
        description: error.message || "Failed to import shops",
        variant: "destructive",
      })
    }
  }

  // Import shops from multiple cities
  const importFromCities = async () => {
    if (!batchCities.trim()) {
      toast({
        title: "Cities required",
        description: "Please enter at least one city",
        variant: "destructive",
      })
      return
    }

    setIsBatchImporting(true)
    setImportProgress(0)

    try {
      // Parse cities
      const cities = batchCities
        .split("\n")
        .map((city) => city.trim())
        .filter(Boolean)

      setImportStats({
        total: cities.length * maxPerCity,
        imported: 0,
        skipped: 0,
        failed: 0,
      })

      // Start import
      const result = await importTopShopsInCities(cities, {
        ...importOptions,
        maxResults: maxPerCity,
      })

      // Update stats
      setImportStats({
        total: cities.length * maxPerCity,
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
      })

      // Set progress to 100%
      setImportProgress(100)

      toast({
        title: "Batch import complete",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error batch importing shops:", error)
      toast({
        title: "Batch import failed",
        description: error.message || "Failed to batch import shops",
        variant: "destructive",
      })
    } finally {
      setIsBatchImporting(false)
    }
  }

  // Refresh all shops
  const handleRefreshAllShops = async () => {
    setIsRefreshing(true)
    setImportProgress(0)

    try {
      // Start refresh
      const result = await refreshAllShops({
        validateBeforeImport: true,
        updateExisting: true,
      })

      // Update stats
      setImportStats({
        total: result.imported + result.skipped + result.failed,
        imported: result.imported,
        skipped: result.skipped,
        failed: result.failed,
      })

      // Set progress to 100%
      setImportProgress(100)

      toast({
        title: "Refresh complete",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      })
    } catch (error) {
      console.error("Error refreshing shops:", error)
      toast({
        title: "Refresh failed",
        description: error.message || "Failed to refresh shops",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Advanced Shop Import</h1>
        <p className="text-muted-foreground">
          Import ice cream shops from Google Places with advanced filtering and validation
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="search">Search & Import</TabsTrigger>
          <TabsTrigger value="batch">Batch Import</TabsTrigger>
          <TabsTrigger value="refresh">Refresh Shops</TabsTrigger>
        </TabsList>

        {/* Search & Import Tab */}
        <TabsContent value="search" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Search Form */}
            <Card>
              <CardHeader>
                <CardTitle>Search for Shops</CardTitle>
                <CardDescription>Search by keyword or location to find ice cream shops</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="query">Search Query</Label>
                    <Input
                      id="query"
                      placeholder="e.g. best ice cream in boston"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      disabled={isSearching}
                    />
                    <p className="text-xs text-muted-foreground">Search for shops by name or description</p>
                  </div>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Location</Label>
                    <Input
                      id="address"
                      placeholder="e.g. Boston, MA or 123 Main St"
                      value={searchAddress}
                      onChange={(e) => setSearchAddress(e.target.value)}
                      disabled={isSearching}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="radius">Search Radius: {searchRadius} km</Label>
                    </div>
                    <Slider
                      id="radius"
                      min={1}
                      max={50}
                      step={1}
                      value={[searchRadius]}
                      onValueChange={(value) => setSearchRadius(value[0])}
                      disabled={isSearching}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1km</span>
                      <span>25km</span>
                      <span>50km</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={isSearching}>
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Search
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Import Options */}
            <Card>
              <CardHeader>
                <CardTitle>Import Options</CardTitle>
                <CardDescription>Configure how shops are imported</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="validate">Validate Before Import</Label>
                      <p className="text-xs text-muted-foreground">Validate shop data before importing</p>
                    </div>
                    <Switch
                      id="validate"
                      checked={importOptions.validateBeforeImport}
                      onCheckedChange={(checked) =>
                        setImportOptions({ ...importOptions, validateBeforeImport: checked })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="skip">Skip Existing Shops</Label>
                      <p className="text-xs text-muted-foreground">Skip shops that already exist in the database</p>
                    </div>
                    <Switch
                      id="skip"
                      checked={importOptions.skipExisting}
                      onCheckedChange={(checked) =>
                        setImportOptions({
                          ...importOptions,
                          skipExisting: checked,
                          updateExisting: checked ? false : importOptions.updateExisting,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="update">Update Existing Shops</Label>
                      <p className="text-xs text-muted-foreground">Update shops that already exist in the database</p>
                    </div>
                    <Switch
                      id="update"
                      checked={importOptions.updateExisting}
                      onCheckedChange={(checked) =>
                        setImportOptions({
                          ...importOptions,
                          updateExisting: checked,
                          skipExisting: checked ? false : importOptions.skipExisting,
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="photos">Import Photos</Label>
                      <p className="text-xs text-muted-foreground">Import shop photos from Google Places</p>
                    </div>
                    <Switch
                      id="photos"
                      checked={importOptions.importPhotos}
                      onCheckedChange={(checked) => setImportOptions({ ...importOptions, importPhotos: checked })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="maxResults">Max Results</Label>
                    <Select
                      value={importOptions.maxResults?.toString() || "10"}
                      onValueChange={(value) =>
                        setImportOptions({ ...importOptions, maxResults: Number.parseInt(value) })
                      }
                    >
                      <SelectTrigger id="maxResults">
                        <SelectValue placeholder="Select max results" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 shops</SelectItem>
                        <SelectItem value="10">10 shops</SelectItem>
                        <SelectItem value="25">25 shops</SelectItem>
                        <SelectItem value="50">50 shops</SelectItem>
                        <SelectItem value="100">100 shops</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Maximum number of shops to import at once</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>Found {searchResults.length} potential shops</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm">
                        <span className="font-medium">{selectedShops.length}</span> shops selected
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllShops}
                        disabled={searchResults.length === 0}
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
                      {searchResults.map((shop) => (
                        <div
                          key={shop.place_id}
                          className="grid grid-cols-[auto_80px_1fr_auto] gap-4 p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleShopSelection(shop)}
                        >
                          <div className="flex items-center justify-center w-8">
                            {shop.isSelected ? (
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
                            <div className="text-sm text-muted-foreground">
                              {shop.vicinity || shop.formatted_address}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {shop.types.slice(0, 3).map((type) => (
                                <Badge key={type} variant="outline" className="text-xs">
                                  {type.replace(/_/g, " ")}
                                </Badge>
                              ))}
                            </div>
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
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div>
                  <span className="text-sm font-medium">{selectedShops.length} shops selected</span>
                </div>
                <Button onClick={importSelectedShops} disabled={selectedShops.length === 0}>
                  <Download className="mr-2 h-4 w-4" />
                  Import Selected Shops
                </Button>
              </CardFooter>
            </Card>
          )}

          {/* Import Progress */}
          {importProgress > 0 && (
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
        </TabsContent>

        {/* Batch Import Tab */}
        <TabsContent value="batch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Batch Import from Cities</CardTitle>
              <CardDescription>Import top-rated ice cream shops from multiple cities at once</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="cities">Cities (one per line)</Label>
                  <Textarea
                    id="cities"
                    placeholder="New York, NY
Boston, MA
Chicago, IL
San Francisco, CA"
                    value={batchCities}
                    onChange={(e) => setBatchCities(e.target.value)}
                    rows={6}
                    disabled={isBatchImporting}
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter one city per line. Each city will be geocoded and searched for ice cream shops.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxPerCity">Max Shops per City: {maxPerCity}</Label>
                  <Slider
                    id="maxPerCity"
                    min={1}
                    max={20}
                    step={1}
                    value={[maxPerCity]}
                    onValueChange={(value) => setMaxPerCity(value[0])}
                    disabled={isBatchImporting}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="topRated" checked={true} disabled />
                    <Label htmlFor="topRated">Import top-rated shops only</Label>
                  </div>
                  <p className="text-xs text-muted-foreground pl-6">Only import shops with a rating of 3.5 or higher</p>
                </div>

                <Button
                  onClick={importFromCities}
                  disabled={isBatchImporting || !batchCities.trim()}
                  className="w-full"
                >
                  {isBatchImporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Start Batch Import
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Import Progress */}
          {importProgress > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Batch Import Progress</CardTitle>
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
        </TabsContent>

        {/* Refresh Tab */}
        <TabsContent value="refresh" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Refresh Existing Shops</CardTitle>
              <CardDescription>Update all existing shops with the latest data from Google Places</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertCircle className="h-5 w-5 text-amber-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-800">Important Note</h3>
                      <div className="mt-2 text-sm text-amber-700">
                        <p>
                          This operation will update all shops in the database with the latest data from Google Places.
                          This may take some time and will use a significant portion of your Google Places API quota.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <Button onClick={handleRefreshAllShops} disabled={isRefreshing} className="w-full">
                  {isRefreshing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Refresh All Shops
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Refresh Progress */}
          {importProgress > 0 && isRefreshing && (
            <Card>
              <CardHeader>
                <CardTitle>Refresh Progress</CardTitle>
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
                    <div className="text-xs text-muted-foreground">Updated</div>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
