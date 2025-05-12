"use client"

import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"

interface MapsLoaderProps {
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function MapsLoader({ onLoad, onError }: MapsLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // Skip if already loaded or errored
    if (loaded || error || window.google?.maps) {
      if (window.google?.maps && !loaded) {
        setLoaded(true)
        onLoad?.()
      }
      return
    }

    const loadMapsApi = async () => {
      try {
        // Get the maps URL from our proxy endpoint
        const response = await fetch("/api/maps/loader")
        const data = await response.json()

        if (!data.configured || !data.mapUrl) {
          throw new Error("Maps API not configured")
        }

        // Define the callback function
        window.initMap = () => {
          setLoaded(true)
          onLoad?.()
        }

        // Create and append the script tag
        const script = document.createElement("script")
        script.src = `${data.mapUrl}?libraries=places,geometry&callback=initMap`
        script.async = true
        script.defer = true
        script.onerror = (e) => {
          const loadError = new Error("Failed to load Google Maps API")
          setError(loadError)
          onError?.(loadError)
          toast({
            title: "Maps Error",
            description: "Failed to load Google Maps. Some features may not work correctly.",
            variant: "destructive",
          })
        }

        document.head.appendChild(script)

        return () => {
          // Clean up
          if (window.initMap) {
            // @ts-ignore
            delete window.initMap
          }
          document.head.removeChild(script)
        }
      } catch (err) {
        const loadError = err instanceof Error ? err : new Error("Unknown error loading maps")
        setError(loadError)
        onError?.(loadError)
        toast({
          title: "Maps Error",
          description: "Failed to load Google Maps. Some features may not work correctly.",
          variant: "destructive",
        })
      }
    }

    loadMapsApi()
  }, [onLoad, onError, loaded, error, toast])

  return null // This component doesn't render anything
}

// Add type definitions for the global window object
declare global {
  interface Window {
    initMap?: () => void
    google?: {
      maps: any
    }
  }
}
