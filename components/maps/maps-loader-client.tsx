"use client"

import { useEffect, useState, type ReactNode } from "react"
import { getGoogleMapsScriptUrl } from "@/app/actions/maps-key-actions"

interface ClientMapsLoaderProps {
  libraries?: string[]
  callback?: string
  children: ReactNode
}

// This is the component that will be dynamically imported
export default function ClientMapsLoader({
  libraries = ["places"],
  callback = "initMap",
  children,
}: ClientMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    const loadMapsApi = async () => {
      try {
        // Get the script URL from the server action
        // This keeps the API key secure on the server
        const scriptUrl = await getGoogleMapsScriptUrl(libraries)

        // Create and append script
        const script = document.createElement("script")
        script.src = scriptUrl
        script.async = true
        script.defer = true

        script.onload = () => {
          setIsLoaded(true)
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
  }, [libraries])

  if (error) {
    return <div className="p-4 text-red-500">Error loading Google Maps: {error}</div>
  }

  return (
    <>
      {isLoaded ? (
        children
      ) : (
        <div className="flex items-center justify-center p-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <span className="ml-2">Loading maps...</span>
        </div>
      )}
    </>
  )
}

// This is a wrapper component that uses the default export
export function MapsLoaderClient({ libraries = ["places"], callback = "initMap", children }: ClientMapsLoaderProps) {
  return (
    <ClientMapsLoader libraries={libraries} callback={callback}>
      {children}
    </ClientMapsLoader>
  )
}
