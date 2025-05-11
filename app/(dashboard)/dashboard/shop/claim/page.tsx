"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, MapPin, Store, Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { searchIceCreamBusinesses, getPlaceDetails, convertPlaceToShop } from "@/lib/services/google-places-service"

export default function ClaimBusinessPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = createClient()

  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedShop, setSelectedShop] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [claimStatus, setClaimStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [activeTab, setActiveTab] = useState("search")
  const [hasShop, setHasShop] = useState(false)
  const [isCheckingShop, setIsCheckingShop] = useState(true)

  // Check if user already has a shop
  useEffect(() => {
    const checkUserShop = async () => {
      if (!user) return

      setIsCheckingShop(true)
      try {
        const { data, error } = await supabase.from("shops").select("*").eq("owner_id", user.id).limit(1)

        if (error) throw error

        if (data && data.length > 0) {
          setHasShop(true)
          // If they already have a shop, redirect to shop dashboard
          router.push("/dashboard/shop")
        } else {
          setHasShop(false)
        }
      } catch (error) {
        console.error("Error checking user shop:", error)
      } finally {
        setIsCheckingShop(false)
      }
    }

    checkUserShop()
  }, [user, supabase, router])

  // Get user's current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Error getting location:", error)
        },
      )
    }
  }

  // Handle search form submission
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setSearchResults([])
    setSelectedShop(null)
    setClaimStatus(null)

    try {
      // First search existing shops in our database
      const { data: existingShops, error } = await supabase
        .from("shops")
        .select("*")
        .ilike("name", `%${searchQuery}%`)
        .is("owner_id", null) // Only show unclaimed shops
        .limit(10)

      if (error) throw error

      // Then search Google Places API
      const { results } = await searchIceCreamBusinesses(searchQuery, location)

      // Combine results, prioritizing our database
      const combinedResults = [
        ...(existingShops || []).map((shop) => ({
          ...shop,
          source: "database",
          place_id: null,
        })),
        ...results.map((place) => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          source: "google",
          place_id: place.place_id,
          rating: place.rating,
        })),
      ]

      setSearchResults(combinedResults)
    } catch (error) {
      console.error("Error searching for businesses:", error)
      toast({
        title: "Search Error",
        description: "Failed to search for businesses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Select a shop to claim
  const selectShop = async (shop: any) => {
    setSelectedShop(shop)
    setClaimStatus(null)

    // If it's a Google Places result, get more details
    if (shop.source === "google" && shop.place_id) {
      setIsLoading(true)
      try {
        const details = await getPlaceDetails(shop.place_id)
        const shopData = convertPlaceToShop(details)

        // Check if this shop already exists in our database
        const { data: existingShops } = await supabase
          .from("shops")
          .select("*")
          .eq("name", shopData.name)
          .eq("address", shopData.address)
          .limit(1)

        if (existingShops && existingShops.length > 0) {
          // Shop exists, update selected shop with database info
          setSelectedShop({
            ...existingShops[0],
            source: "database",
          })
        } else {
          // New shop from Google, update with full details
          setSelectedShop({
            ...shopData,
            source: "google",
            place_id: shop.place_id,
          })
        }
      } catch (error) {
        console.error("Error getting place details:", error)
      } finally {
        setIsLoading(false)
      }
    }
  }

  // Claim a shop
  const claimShop = async () => {
    if (!selectedShop || !user) return

    setIsLoading(true)
    setClaimStatus(null)

    try {
      if (selectedShop.source === "database") {
        // Claim existing shop in database
        const { error } = await supabase
          .from("shops")
          .update({
            owner_id: user.id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", selectedShop.id)

        if (error) throw error

        setClaimStatus({
          success: true,
          message: `You've successfully claimed ${selectedShop.name}. Your claim is pending verification.`,
        })
      } else {
        // Import from Google Places and claim
        const shopData = {
          ...selectedShop,
          owner_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }

        // Remove any fields that aren't in our database schema
        delete shopData.source
        delete shopData.place_id

        const { error } = await supabase.from("shops").insert([shopData])

        if (error) throw error

        setClaimStatus({
          success: true,
          message: `You've successfully claimed ${selectedShop.name}. Your claim is pending verification.`,
        })
      }

      // After successful claim, redirect to shop dashboard after a delay
      setTimeout(() => {
        router.push("/dashboard/shop")
      }, 3000)
    } catch (error) {
      console.error("Error claiming shop:", error)
      setClaimStatus({
        success: false,
        message: "Failed to claim shop. Please try again or contact support.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Create a new shop
  const createNewShop = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const shopName = formData.get("shopName") as string
    const address = formData.get("address") as string
    const city = formData.get("city") as string
    const state = formData.get("state") as string

    try {
      const { data, error } = await supabase
        .from("shops")
        .insert([
          {
            name: shopName,
            address,
            city,
            state,
            owner_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Shop Created",
        description: "Your shop has been created successfully!",
      })

      // Redirect to shop dashboard
      router.push("/dashboard/shop")
    } catch (error) {
      console.error("Error creating shop:", error)
      toast({
        title: "Error",
        description: "Failed to create shop. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingShop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (hasShop) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>You already have a shop</CardTitle>
            <CardDescription>You've already claimed or created a shop.</CardDescription>
          </CardHeader>
          <CardContent>
            <p>You can manage your shop from the dashboard.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/dashboard/shop")} className="w-full">
              Go to Shop Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Claim Your Business</h1>
          <p className="text-muted-foreground">Search for your business or create a new listing</p>
        </div>
      </div>

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
                      <div className="grid gap-6 md:grid-cols-2">
                        {/* Contact Information */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Contact Information</h3>
                          <div className="space-y-2">
                            {selectedShop.phone && (
                              <div className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-muted-foreground"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                </svg>
                                <span>{selectedShop.phone}</span>
                              </div>
                            )}
                            {selectedShop.website && (
                              <div className="flex items-center gap-2">
                                <svg
                                  className="h-4 w-4 text-muted-foreground"
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <circle cx="12" cy="12" r="10" />
                                  <line x1="2" y1="12" x2="22" y2="12" />
                                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                </svg>
                                <a
                                  href={selectedShop.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:underline"
                                >
                                  {selectedShop.website.replace(/^https?:\/\//, "")}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Location */}
                        <div className="space-y-4">
                          <h3 className="font-semibold">Location</h3>
                          <div className="space-y-1">
                            <p>{selectedShop.address}</p>
                            {selectedShop.city && selectedShop.state && (
                              <p>
                                {selectedShop.city}, {selectedShop.state}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      {selectedShop.description && (
                        <div className="space-y-2">
                          <h3 className="font-semibold">Description</h3>
                          <p>{selectedShop.description}</p>
                        </div>
                      )}

                      {/* Claim Status */}
                      {claimStatus && (
                        <Alert variant={claimStatus.success ? "default" : "destructive"}>
                          <AlertTitle>{claimStatus.success ? "Success" : "Error"}</AlertTitle>
                          <AlertDescription>{claimStatus.message}</AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ) : (
                    <div className="flex h-40 flex-col items-center justify-center text-center text-muted-foreground">
                      <Store className="mb-2 h-8 w-8" />
                      <p>Select a business from the search results to claim it</p>
                    </div>
                  )}
                </CardContent>
                {selectedShop && !claimStatus?.success && (
                  <CardFooter>
                    <Button className="w-full" onClick={claimShop} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                        </>
                      ) : (
                        <>Claim {selectedShop.name}</>
                      )}
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="create">
          <Card>
            <CardHeader>
              <CardTitle>Create a New Business Listing</CardTitle>
              <CardDescription>Add your ice cream shop to ConeDex</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={createNewShop} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="shopName" className="text-sm font-medium">
                    Business Name
                  </label>
                  <Input id="shopName" name="shopName" placeholder="Sweet Scoops Ice Cream" required />
                </div>

                <div className="space-y-2">
                  <label htmlFor="address" className="text-sm font-medium">
                    Street Address
                  </label>
                  <Input id="address" name="address" placeholder="123 Main Street" required />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="city" className="text-sm font-medium">
                      City
                    </label>
                    <Input id="city" name="city" placeholder="San Francisco" required />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="state" className="text-sm font-medium">
                      State
                    </label>
                    <Input id="state" name="state" placeholder="CA" required />
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Verification Required</AlertTitle>
                  <AlertDescription>
                    New business listings require verification. We'll contact you to verify your ownership.
                  </AlertDescription>
                </Alert>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
                    </>
                  ) : (
                    <>Create Business Listing</>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
