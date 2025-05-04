"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Store, Loader2, AlertCircle } from "lucide-react"

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
import { isPreviewEnvironment } from "@/lib/utils/preview-detection"

// Mock data for preview environments
const MOCK_SEARCH_RESULTS = [
  {
    id: "mock-1",
    name: "Sweet Scoops Ice Cream",
    address: "123 Main Street, San Francisco, CA",
    source: "database",
    rating: 4.7,
  },
  {
    id: "mock-2",
    name: "Frosty Delights",
    address: "456 Market Street, San Francisco, CA",
    source: "google",
    place_id: "mock-place-2",
    rating: 4.5,
  },
  {
    id: "mock-3",
    name: "Creamy Dreams",
    address: "789 Mission Street, San Francisco, CA",
    source: "google",
    place_id: "mock-place-3",
    rating: 4.2,
  },
]

const MOCK_SHOP_DETAILS = {
  id: "mock-1",
  name: "Sweet Scoops Ice Cream",
  address: "123 Main Street",
  city: "San Francisco",
  state: "CA",
  phone: "(415) 555-1234",
  website: "https://sweetscoops.example.com",
  description: "A family-owned ice cream shop serving handcrafted flavors since 1985.",
  image_url: "/placeholder.svg?key=zcks3",
  rating: 4.7,
  source: "database",
}

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

      // In preview mode, simulate the check
      if (isPreviewEnvironment()) {
        setHasShop(false)
        setIsCheckingShop(false)
        return
      }

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
    if (isPreviewEnvironment()) {
      // Mock location for preview
      setLocation({
        lat: 37.7749,
        lng: -122.4194,
      })
      return
    }

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
      // In preview mode, use mock data
      if (isPreviewEnvironment()) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000))
        setSearchResults(MOCK_SEARCH_RESULTS)
        setIsSearching(false)
        return
      }

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

    // In preview mode, use mock data
    if (isPreviewEnvironment()) {
      setIsLoading(true)
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setSelectedShop(MOCK_SHOP_DETAILS)
      setIsLoading(false)
      return
    }

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
      // In preview mode, simulate claiming
      if (isPreviewEnvironment()) {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setClaimStatus({
          success: true,
          message: `You've successfully claimed ${selectedShop.name}. Your claim is pending verification.`,
        })

        // After successful claim, redirect to shop dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard/shop")
        }, 3000)

        return
      }

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

        const { data: newShop, error: insertError } = await supabase.from("shops").insert([shopData]).select().single()

        if (insertError) throw insertError

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
      toast({
        title: "Claim Error",
        description: "Failed to claim the shop. Please try again.",
        variant: "destructive",
      })
      setClaimStatus({
        success: false,
        message: "Failed to claim the shop. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative hidden h-full flex-col md:flex">
      <Tabs
        defaultValue="search"
        className="w-[400px]"
        value={activeTab}
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
        </TabsList>
        <TabsContent value="search">
          {isCheckingShop ? (
            <Card>
              <CardHeader>
                <CardTitle>Checking your shop...</CardTitle>
              </CardHeader>
              <CardContent>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              </CardContent>
            </Card>
          ) : hasShop ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>You already have a shop!</AlertTitle>
              <AlertDescription>You can manage your shop in the shop dashboard.</AlertDescription>
            </Alert>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Claim Your Ice Cream Shop</CardTitle>
                <CardDescription>Search for your business to claim it.</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSearch}>
                  <div className="grid gap-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="search">Search</label>
                      <Input
                        id="search"
                        className="col-span-3"
                        type="text"
                        placeholder="Shop name"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button type="submit" className="mt-4" disabled={isSearching}>
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

                {searchResults.length > 0 && (
                  <div className="mt-4">
                    <h3>Search Results</h3>
                    <ul>
                      {searchResults.map((shop) => (
                        <li key={shop.id} className="mb-2">
                          <Button variant="secondary" onClick={() => selectShop(shop)} className="w-full justify-start">
                            <Store className="mr-2 h-4 w-4" />
                            {shop.name} - {shop.address}
                            {shop.source === "database" && <Badge className="ml-2">Database</Badge>}
                          </Button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {selectedShop && (
        <Card className="w-[400px] mt-4">
          <CardHeader>
            <CardTitle>Shop Details</CardTitle>
            <CardDescription>Verify the details of the shop you are claiming.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                <span>Loading shop details...</span>
              </div>
            ) : (
              <>
                <div className="grid gap-2">
                  <div>
                    <p className="text-sm font-medium leading-none">Name</p>
                    <p className="text-sm text-muted-foreground">{selectedShop.name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">Address</p>
                    <p className="text-sm text-muted-foreground">{selectedShop.address}</p>
                  </div>
                  {selectedShop.phone && (
                    <div>
                      <p className="text-sm font-medium leading-none">Phone</p>
                      <p className="text-sm text-muted-foreground">{selectedShop.phone}</p>
                    </div>
                  )}
                  {selectedShop.website && (
                    <div>
                      <p className="text-sm font-medium leading-none">Website</p>
                      <p className="text-sm text-muted-foreground">{selectedShop.website}</p>
                    </div>
                  )}
                  {selectedShop.description && (
                    <div>
                      <p className="text-sm font-medium leading-none">Description</p>
                      <p className="text-sm text-muted-foreground">{selectedShop.description}</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={claimShop} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Claiming...
                </>
              ) : (
                "Claim Shop"
              )}
            </Button>
          </CardFooter>
        </Card>
      )}

      {claimStatus && (
        <Alert variant={claimStatus.success ? "default" : "destructive"}>
          {claimStatus.success ? (
            <>
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{claimStatus.message}</AlertDescription>
            </>
          ) : (
            <>
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{claimStatus.message}</AlertDescription>
            </>
          )}
        </Alert>
      )}
    </div>
  )
}
