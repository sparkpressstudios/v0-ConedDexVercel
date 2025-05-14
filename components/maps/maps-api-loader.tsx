"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { getGoogleMapsScriptUrl } from "@/app/actions/maps-key-actions"

interface MapsApiLoaderProps {
  children: React.ReactNode
  libraries?: string[]
  callback?: string
}

export default function MapsApiLoader({ children, libraries = ["places"], callback = "initMap" }: MapsApiLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Define the callback function
    window[callback as keyof typeof window] = () => {
      setIsLoaded(true)
    }

    // Get the script URL from our server action
    const loadMapsApi = async () => {
      try {
        const scriptUrl = await getGoogleMapsScriptUrl(libraries)

        // Create and append script
        const script = document.createElement("script")
        script.src = scriptUrl
        script.async = true
        script.defer = true

        script.onload = () => {
          // The callback will handle setting isLoaded
        }

        script.onerror = () => {
          setError("Failed to load Google Maps API")
        }

        document.head.appendChild(script)
      } catch (err) {
        setError("Failed to get Maps API URL")
        console.error("Error fetching Maps API URL:", err)
      }
    }

    loadMapsApi()

    return () => {
      // Clean up
      delete window[callback as keyof typeof window]
    }
  }, [libraries, callback])

  if (error) {
    return <div className="p-4 text-red-500">Error loading Google Maps: {error}</div>
  }

  return (
    <>
      <div className={isLoaded ? "block" : "hidden"}>{children}</div>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading maps...</span>
        </div>
      )}
    </>
  )
}
