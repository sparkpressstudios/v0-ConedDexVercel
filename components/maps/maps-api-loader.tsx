"use client"

import { useEffect, useState } from "react"
import { getMapsApiUrl } from "@/app/api/maps/actions"

interface MapsApiLoaderProps {
  onLoad?: () => void
  onError?: (error: Error) => void
}

declare global {
  interface Window {
    initMap: () => void
  }
}

export function MapsApiLoader({ onLoad, onError }: MapsApiLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function loadMapsApi() {
      try {
        // Check if Maps API is already loaded
        if (window.google?.maps) {
          setLoaded(true)
          onLoad?.()
          return
        }

        // Get the Maps API URL from the server
        const mapsUrl = await getMapsApiUrl()

        if (!mapsUrl) {
          throw new Error("Maps API not configured")
        }

        // Define the callback function
        window.initMap = () => {
          setLoaded(true)
          onLoad?.()
        }

        // Create and append the script tag
        const script = document.createElement("script")
        script.src = mapsUrl
        script.async = true
        script.defer = true
        script.onerror = (e) => {
          const error = new Error("Failed to load Google Maps API")
          setError(error)
          onError?.(error)
        }

        document.head.appendChild(script)

        return () => {
          // Clean up
          if (window.initMap) {
            delete window.initMap
          }
          document.head.removeChild(script)
        }
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error loading Maps API")
        setError(error)
        onError?.(error)
      }
    }

    loadMapsApi()
  }, [onLoad, onError])

  return null
}
