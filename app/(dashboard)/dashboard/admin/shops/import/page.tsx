"use client"

import { ShopScraper } from "@/components/admin/shop-scraper"
import { PuppeteerTestRunner } from "@/components/admin/testing/puppeteer-test-runner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import {
  searchBusinesses,
  getBusinessDetails,
  importShopToDatabase,
  batchImportShops,
} from "@/app/actions/shop-import-actions"
import type { PlaceDetails } from "@/lib/services/google-places-service"

// Popular US cities for ice cream
const popularLocations = [
  { name: "New York, NY", lat: 40.7128, lng: -74.006 },
  { name: "Los Angeles, CA", lat: 34.0522, lng: -118.2437 },
  { name: "Chicago, IL", lat: 41.8781, lng: -87.6298 },
  { name: "Miami, FL", lat: 25.7617, lng: -80.1918 },
  { name: "San Francisco, CA", lat: 37.7749, lng: -122.4194 },
  { name: "Portland, OR", lat: 45.5152, lng: -122.6784 },
  { name: "Austin, TX", lat: 30.2672, lng: -97.7431 },
  { name: "Seattle, WA", lat: 47.6062, lng: -122.3321 },
  { name: "Boston, MA", lat: 42.3601, lng: -71.0589 },
  { name: "Denver, CO", lat: 39.7392, lng: -104.9903 },
]

export default function ShopsImportPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [selectedPlace, setSelectedPlace] = useState<PlaceDetails | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [importStatus, setImportStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [nextPageToken, setNextPageToken] = useState<string | undefined>(undefined)
  const [activeTab, setActiveTab] = useState("scraper")
  const [batchImportStatus, setBatchImportStatus] = useState<{
    isRunning: boolean
    total: number
    processed: number
    imported: number
    skipped: number
    failed: number
    currentLocation: string
  }>({
    isRunning: false,
    total: 0,
    processed: 0,
    imported: 0,
    skipped: 0,
    failed: 0,
    currentLocation: "",
  })
  const [selectedLocations, setSelectedLocations] = useState<string[]>([])
  const [batchRadius, setBatchRadius] = useState(25000)
  const [showBatchDialog, setShowBatchDialog] = useState(false)
  const [existingShops, setExistingShops] = useState<any[]>([])

  // Fetch existing shops on component mount
  useEffect(() => {
    const fetchExistingShops = async () => {
      try {
        const supabase = createClient()
        const { data, error } = await supabase.from("shops").select("id, name, address")

        if (error) throw error
        setExistingShops(data || [])
      } catch (error) {
        console.error("Error fetching existing shops:", error)
      }
    }

    fetchExistingShops()
  }, [])

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
    setSelectedPlace(null)
    setImportStatus(null)

    try {
      const result = await searchBusinesses(searchQuery, location)
      if (result.success) {
        setSearchResults(result.results)
        setNextPageToken(result.nextPageToken)
      } else {
        setImportStatus({
          success: false,
          message: result.error || "Failed to search for businesses. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error searching for businesses:", error)
      setImportStatus({
        success: false,
        message: "Failed to search for businesses. Please try again.",
      })
    } finally {
      setIsSearching(false)
    }
  }

  // Load more results
  const loadMoreResults = async () => {
    if (!nextPageToken) return

    setIsSearching(true)
    try {
      const result = await searchBusinesses(searchQuery, location, 50000, nextPageToken)
      if (result.success) {
        setSearchResults([...searchResults, ...result.results])
        setNextPageToken(result.nextPageToken)
      }
    } catch (error) {
      console.error("Error loading more businesses:", error)
    } finally {
      setIsSearching(false)
    }
  }

  // View details of a place
  const viewPlaceDetails = async (placeId: string) => {
    setIsLoadingDetails(true)
    setSelectedPlace(null)
    setImportStatus(null)

    try {
      const result = await getBusinessDetails(placeId)
      if (result.success) {
        setSelectedPlace(result.details)
      } else {
        setImportStatus({
          success: false,
          message: result.error || "Failed to load business details. Please try again.",
        })
      }
    } catch (error) {
      console.error("Error getting place details:", error)
      setImportStatus({
        success: false,
        message: "Failed to load business details. Please try again.",
      })
    } finally {
      setIsLoadingDetails(false)
    }
  }

  // Import a shop to the database
  const importShop = async () => {
    if (!selectedPlace) return

    setIsImporting(true)
    setImportStatus(null)

    try {
      const result = await importShopToDatabase(selectedPlace)
      setImportStatus({
        success: result.success,
        message: result.message,
      })

      if (result.success) {
        // Clear selected place after successful import
        setTimeout(() => {
          setSelectedPlace(null)
        }, 2000)
      }
    } catch (error) {
      console.error("Error importing shop:", error)
      setImportStatus({
        success: false,
        message: "Failed to import shop. Please try again.",
      })
    } finally {
      setIsImporting(false)
    }
  }

  // Toggle location selection for batch import
  const toggleLocationSelection = (locationName: string) => {
    if (selectedLocations.includes(locationName)) {
      setSelectedLocations(selectedLocations.filter((name) => name !== locationName))
    } else {
      setSelectedLocations([...selectedLocations, locationName])
    }
  }

  // Start batch import process
  const startBatchImport = async () => {
    if (selectedLocations.length === 0) return

    setShowBatchDialog(true)
    setBatchImportStatus({
      isRunning: true,
      total: 0,
      processed: 0,
      imported: 0,
      skipped: 0,
      failed: 0,
      currentLocation: "",
    })

    const selectedLocationData = popularLocations.filter((loc) => selectedLocations.includes(loc.name))

    try {
      const result = await batchImportShops(selectedLocationData, batchRadius)

      if (result.success) {
        setBatchImportStatus({
          isRunning: false,
          total: result.total,
          processed: result.processed,
          imported: result.imported,
          skipped: result.skipped,
          failed: result.failed,
          currentLocation: "Complete",
        })
      } else {
        setBatchImportStatus({
          isRunning: false,
          total: 0,
          processed: 0,
          imported: 0,
          skipped: 0,
          failed: 0,
          currentLocation: "Error: " + (result.error || "Unknown error"),
        })
      }
    } catch (error) {
      console.error("Error in batch import:", error)
      setBatchImportStatus({
        isRunning: false,
        total: 0,
        processed: 0,
        imported: 0,
        skipped: 0,
        failed: 0,
        currentLocation: "Error occurred during import",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Shops</h1>
        <p className="text-muted-foreground">Import ice cream shops from various sources</p>
      </div>

      <Tabs defaultValue="scraper">
        <TabsList>
          <TabsTrigger value="scraper">Web Scraper</TabsTrigger>
          <TabsTrigger value="csv">CSV Upload</TabsTrigger>
          <TabsTrigger value="api">API Import</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="scraper" className="space-y-4">
          <ShopScraper />
        </TabsContent>

        <TabsContent value="csv" className="space-y-4">
          {/* Existing CSV upload component would go here */}
          <p>CSV upload functionality</p>
        </TabsContent>

        <TabsContent value="api" className="space-y-4">
          {/* Existing API import component would go here */}
          <p>API import functionality</p>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <PuppeteerTestRunner />
        </TabsContent>
      </Tabs>
    </div>
  )
}
