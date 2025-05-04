"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Store, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// This is a special version of the shop claim page that works in preview mode
export function PreviewShopClaim() {
  const router = useRouter()
  const { toast } = useToast()

  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedShop, setSelectedShop] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [claimStatus, setClaimStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("search")

  // Mock data for preview
  const mockShops = [
    {
      id: "1",
      name: "Sweet Scoops Ice Cream",
      address: "123 Main Street",
      city: "San Francisco",
      state: "CA",
      source: "database",
      rating: 4.5,
    },
    {
      id: "2",
      name: "Frosty Delights",
      address: "456 Market Street",
      city: "San Francisco",
      state: "CA",
      source: "google",
      place_id: "place123",
      rating: 4.2,
    },
    {
      id: "3",
      name: "Creamy Dreams",
      address: "789 Mission Street",
      city: "San Francisco",
      state: "CA",
      source: "database",
      rating: 4.8,
    },
  ]

  // Get user's current location
  const getCurrentLocation = () => {
    setLocation({
      lat: 37.7749,
      lng: -122.4194,
    })
    toast({
      title: "Location Set",
      description: "Using San Francisco coordinates for preview.",
    })
  }

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setSearchResults([])
    setSelectedShop(null)
    setClaimStatus(null)

    // Simulate API call delay
    setTimeout(() => {
      // Filter mock shops based on search query
      const filteredShops = mockShops.filter(
        (shop) =>
          shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          shop.address.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      setSearchResults(filteredShops)
      setIsSearching(false)
    }, 1000)
  }

  // Select a shop to claim
  const selectShop = async (shop: any) => {
    setSelectedShop(shop)
    setClaimStatus(null)

    // If it's a Google Places result, get more details
    if (shop.source === "google" && shop.place_id) {
      setIsLoading(true)

      // Simulate API call delay
      setTimeout(() => {
        const enhancedShop = {
          ...shop,
          phone: "(415) 555-1234",
          website: "https://example.com",
          description: "A delightful ice cream shop with a variety of flavors.",
          image_url: "/colorful-ice-cream-shop.png",
        }

        setSelectedShop(enhancedShop)
        setIsLoading(false)
      }, 1000)
    }
  }

  // Claim a shop
  const claimShop = async () => {
    if (!selectedShop) return

    setIsLoading(true)
    setClaimStatus(null)

    // Simulate API call delay
    setTimeout(() => {
      setClaimStatus({
        success: true,
        message: `You've successfully claimed ${selectedShop.name}. Your claim is pending verification.`,
      })
      setIsLoading(false)

      // After successful claim, redirect to shop dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard/shop")
      }, 3000)
    }, 1500)
  }

  // Create a new shop
  const createNewShop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const shopName = formData.get("shopName") as string

    // Simulate API call delay
    setTimeout(() => {
      toast({
        title: "Shop Created",
        description: "Your shop has been created successfully!",
      })

      setIsLoading(false)

      // Redirect to shop dashboard
      router.push("/dashboard/shop")
    }, 1500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Claim Your Business</h1>
          <p className="text-muted-foreground">Search for your business or create a new listing</p>
        </div>
      </div>

      <Alert className="bg-yellow-50 text-yellow-800 border-yellow-300">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Preview Mode</AlertTitle>
        <AlertDescription>
          This is a preview of the shop claim page. All actions are simulated and no data will be saved.
        </AlertDescription>
      </Alert>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Find Existing
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            Create New
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Search for Your Business</CardTitle>
              <CardDescription>Find your ice cream shop to claim ownership</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSearch} className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Input
                      placeholder="Search by business name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={getCurrentLocation}>
                      <MapPin className="mr-2 h-4 w-4" />
                      {location ? "Location Set" : "Use My Location"}
                    </Button>
                    <Button type="submit" disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Search className="mr-2 h-4 w-4" />
                      )}
                      Search
                    </Button>
                  </div>
                </div>
                {location && (
                  <div className="text-sm text-muted-foreground">
                    Using location: {location.lat.toFixed(4)}, {location.lng.toFixed(4)}
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-5">
            {/* Search Results */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Search Results</CardTitle>
                  <CardDescription>
                    {searchResults.length > 0
                      ? `Found ${searchResults.length} businesses matching your search`
                      : "Search results will appear here"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSearching ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-4">
                      {searchResults.map((shop) => (
                        <div
                          key={shop.id}
                          className={`cursor-pointer rounded-lg border p-4 transition-all hover:bg-accent ${
                            selectedShop?.id === shop.id ? "border-primary bg-accent" : ""
                          }`}
                          onClick={() => selectShop(shop)}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-medium">{shop.name}</h3>
                              <p className="text-sm text-muted-foreground">{shop.address}</p>
                              <div className="mt-1">
                                <Badge variant="outline">
                                  {shop.source === "database" ? "In ConeDex" : "Google Places"}
                                </Badge>
                              </div>
                            </div>
                            {shop.rating && (
                              <div className="flex items-center">
                                <svg
                                  className="mr-1 h-4 w-4 fill-amber-400 text-amber-400"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                >
                                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                </svg>
                                <span className="text-sm font-medium">{shop.rating}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                      <Search className="mb-2 h-8 w-8" />
                      <p>No results found. Try a different search term or create a new listing.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Business Details */}
            <div className="lg:col-span-3">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>Business Details</CardTitle>
                  <CardDescription>
                    {selectedShop
                      ? `Details for ${selectedShop.name}`
                      : "Select a business to view its details and claim it"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex h-40 items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : selectedShop ? (
                    <div className="space-y-6">
                      {/* Business Header */}
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <h2 className="text-2xl font-bold">{selectedShop.name}</h2>
                          <p className="text-muted-foreground">
                            {selectedShop.address}
                            {selectedShop.city && `, ${selectedShop.city}`}
                            {selectedShop.state && `, ${selectedShop.state}`}
                          </p>
                          {selectedShop.rating && (
                            <div className="mt-1 flex items-center">
                              <div className="flex">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <svg
                                    key={star}
                                    className={`h-4 w-4 ${
                                      star <= Math.round(selectedShop.rating || 0)
                                        ? "fill-amber-400 text-amber-400"
                                        : "text-gray-300"
                                    }`}
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="ml-2 text-sm">{selectedShop.rating}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant={selectedShop.source === "database" ? "default" : "secondary"}>
                          {selectedShop.source === "database" ? "In ConeDex" : "From Google Places"}
                        </Badge>
                      </div>

                      {/* Business Image */}
                      {selectedShop.image_url && (
                        <div className="overflow-hidden rounded-md">
                          <img
                            src={selectedShop.image_url || "/placeholder.svg"}
                            alt={selectedShop.name}
                            className="h-64 w-full object-cover"
                          />
                        </div>
                      )}

                      {/* Business Details */}
                      <div className="grid gap-4 md:grid-cols-2">
                        {selectedShop.phone && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                            <p>{selectedShop.phone}</p>
                          </div>
                        )}
                        {selectedShop.website && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Website</h3>
                            <p className="truncate">
                              <a
                                href={selectedShop.website}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {selectedShop.website}
                              </a>
                            </p>
                          </div>
                        )}
                      </div>

                      {selectedShop.description && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                          <p>{selectedShop.description}</p>
                        </div>
                      )}

                      {/* Claim Button */}
                      <div className="flex flex-col gap-4">
                        {claimStatus ? (
                          <Alert
                            className={
                              claimStatus.success
                                ? "bg-green-50 text-green-800 border-green-300"
                                : "bg-red-50 text-red-800 border-red-300"
                            }
                          >
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>{claimStatus.success ? "Success!" : "Error"}</AlertTitle>
                            <AlertDescription>{claimStatus.message}</AlertDescription>
                          </Alert>
                        ) : (
                          <Button onClick={claimShop} disabled={isLoading} className="w-full sm:w-auto">
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Claim This Business</>
                            )}
                          </Button>
                        )}
                        <p className="text-sm text-muted-foreground">
                          By claiming this business, you confirm that you are the owner or authorized representative of
                          this establishment.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                      <Store className="mb-2 h-8 w-8" />
                      <p>Select a business from the search results to view details and claim it.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Business Listing</CardTitle>
              <CardDescription>Can't find your business? Add it to ConeDex!</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createNewShop} className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="shopName" className="text-sm font-medium">
                      Business Name <span className="text-red-500">*</span>
                    </label>
                    <Input id="shopName" name="shopName" placeholder="Sweet Scoops Ice Cream" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="shopType" className="text-sm font-medium">
                      Business Type <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="shopType"
                      name="shopType"
                      placeholder="Ice Cream Shop"
                      defaultValue="Ice Cream Shop"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="address" className="text-sm font-medium">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <Input id="address" name="address" placeholder="123 Main Street" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City <span className="text-red-500">*</span>
                    </label>
                    <Input id="city" name="city" placeholder="San Francisco" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">
                      State <span className="text-red-500">*</span>
                    </label>
                    <Input id="state" name="state" placeholder="CA" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="zipCode" className="text-sm font-medium">
                      ZIP Code <span className="text-red-500">*</span>
                    </label>
                    <Input id="zipCode" name="zipCode" placeholder="94103" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-medium">
                      Phone Number
                    </label>
                    <Input id="phone" name="phone" placeholder="(415) 555-1234" />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="website" className="text-sm font-medium">
                      Website
                    </label>
                    <Input id="website" name="website" placeholder="https://example.com" type="url" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="description" className="text-sm font-medium">
                    Business Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    placeholder="Tell us about your ice cream shop..."
                    className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>

                <div className="flex flex-col gap-4">
                  <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>Create Business Listing</>
                    )}
                  </Button>
                  <p className="text-sm text-muted-foreground">
                    By creating a business listing, you confirm that you are the owner or authorized representative of
                    this establishment.
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
