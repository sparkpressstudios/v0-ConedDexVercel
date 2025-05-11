"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface MapsLoaderProps {
  onLoad?: () => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    initMap: () => void
    google?: {
      maps: any
    }
  }
}

export function MapsLoader({ onLoad, onError }: MapsLoaderProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Skip if Google Maps is already loaded
    if (window.google?.maps) {
      setLoading(false)
      onLoad?.()
      return
    }

    // Set up the callback function that the Google Maps API will call when loaded
    window.initMap = () => {
      setLoading(false)
      onLoad?.()
    }

    // Load the Google Maps API through our proxy endpoint
    const loadMapsApi = async () => {
      try {
        // Fetch configuration from our secure endpoint
        const response = await fetch("/api/maps/loader")
        const data = await response.json()

        if (!data.configured) {
          throw new Error("Maps API is not configured")
        }

        // Create a script element to load the Maps API
        const script = document.createElement("script")
        script.src = data.mapUrl
        script.async = true
        script.defer = true

        // Handle script load errors
        script.onerror = () => {
          setError("Failed to load Google Maps. Please try again later.")
          setLoading(false)
          onError?.(new Error("Failed to load Google Maps"))
        }

        // Add the script to the document
        document.head.appendChild(script)
      } catch (error) {
        console.error("Error loading Google Maps:", error)
        setError("Failed to load Google Maps. Please try again later.")
        setLoading(false)
        onError?.(error instanceof Error ? error : new Error("Unknown error loading Maps API"))
      }
    }

    loadMapsApi()

    // Clean up
    return () => {
      window.initMap = () => {}
    }
  }, [onLoad, onError])

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (loading) {
    return <div className="w-full h-full bg-gray-100 animate-pulse rounded-md" />
  }

  return null
}
