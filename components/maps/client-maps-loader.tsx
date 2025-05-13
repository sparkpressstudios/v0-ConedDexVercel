"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ClientMapsLoaderProps {
  libraries?: string[]
  callback?: string
  children: React.ReactNode
  onMapLoad?: (map: google.maps.Map) => void
  options?: google.maps.MapOptions
}

// Declare google as a global variable
declare global {
  interface Window {
    google?: any
    [key: string]: any
  }
}

export function ClientMapsLoader({
  libraries = ["places"],
  callback = "initMap",
  children,
  onMapLoad,
  options = {},
}: ClientMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const router = useRouter()
  const mapContainerId = "google-map-container"

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      initializeMap()
      return
    }

    const loadMapsApi = async () => {
      try {
        // Define the callback function
        window[callback as keyof typeof window] = () => {
          setIsLoaded(true)
          initializeMap()
        }

        // Create script element
        const script = document.createElement("script")
        script.async = true
        script.defer = true

        // Use our proxy endpoint to load the script
        const librariesParam = libraries.join(",")
        script.src = `/api/maps/script?libraries=${librariesParam}&callback=${callback}`

        // Handle errors
        script.onerror = () => {
          setError("Failed to load Google Maps API")
        }

        // Append script to document
        document.head.appendChild(script)

        return () => {
          // Clean up
          document.head.removeChild(script)
          delete window[callback as keyof typeof window]
        }
      } catch (err) {
        setError("Error initializing Google Maps")
        console.error("Error loading Google Maps:", err)
      }
    }

    loadMapsApi()
  }, [libraries, callback, router])

  // Initialize map when API is loaded
  const initializeMap = () => {
    if (!onMapLoad || mapInstance) return

    // Create map instance
    const mapElement = document.getElementById(mapContainerId)
    if (mapElement && window.google) {
      const map = new window.google.maps.Map(mapElement, {
        center: { lat: 37.0902, lng: -95.7129 }, // Default to center of US
        zoom: 4,
        ...options,
      })
      setMapInstance(map)
      onMapLoad(map)
    }
  }

  if (error) {
    return <div className="p-4 text-red-500">Error loading Google Maps: {error}</div>
  }

  return (
    <>
      {!isLoaded && (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading maps...</span>
        </div>
      )}
      <div className={isLoaded ? "block h-full w-full" : "hidden"}>
        {onMapLoad ? <div id={mapContainerId} className="h-full w-full"></div> : children}
      </div>
    </>
  )
}

// Add default export to fix the deployment error
export default ClientMapsLoader
