"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { getGoogleMapsScriptUrl } from "@/app/actions/maps-key-actions"

interface ClientMapsLoaderProps {
  children: React.ReactNode
  libraries?: string[]
}

export default function ClientMapsLoader({ children, libraries = ["places"] }: ClientMapsLoaderProps) {
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
