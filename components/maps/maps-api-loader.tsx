"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getGoogleMapsScriptUrl } from "@/app/actions/maps-key-actions"

interface MapsApiLoaderProps {
  children: React.ReactNode
  libraries?: string[]
}

export default function MapsApiLoader({ children, libraries = ["places"] }: MapsApiLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Maps API is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    const loadGoogleMapsApi = async () => {
      try {
        // Get the script URL from the server action
        const scriptUrl = await getGoogleMapsScriptUrl(libraries)

        // Create and append the script
        const script = document.createElement("script")
        script.src = scriptUrl
        script.async = true
        script.defer = true
        script.onerror = () => {
          setError("Failed to load Google Maps API")
        }
        script.onload = () => {
          setIsLoaded(true)
        }

        document.head.appendChild(script)
      } catch (err) {
        console.error("Error loading Google Maps API:", err)
        setError("Failed to load Google Maps API")
      }
    }

    loadGoogleMapsApi()
  }, [libraries])

  if (error) {
    return <div className="p-4 text-red-500">Error: {error}</div>
  }

  if (!isLoaded) {
    return <div className="p-4">Loading Google Maps...</div>
  }

  return <>{children}</>
}
