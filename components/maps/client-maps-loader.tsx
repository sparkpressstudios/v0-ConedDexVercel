"use client"

import { useEffect, useState, type ReactNode } from "react"
import { getMapsApiKey } from "@/app/actions/maps-key-actions"

interface ClientMapsLoaderProps {
  libraries?: string[]
  callback?: string
  children: ReactNode
}

export default function ClientMapsLoader({
  libraries = ["places"],
  callback = "initMap",
  children,
}: ClientMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Skip if already loaded
    if (window.google?.maps || isLoaded) {
      setIsLoaded(true)
      return
    }

    // Define the callback function
    window[callback as keyof typeof window] = () => {
      setIsLoaded(true)
    }

    const loadMapsApi = async () => {
      try {
        // Get API key from server
        const apiKey = await getMapsApiKey()

        // Create script element
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=${libraries.join(",")}&v=weekly&callback=${callback}`
        script.async = true
        script.defer = true
        script.onerror = (e) => {
          setError(new Error("Failed to load Google Maps API"))
        }

        // Append script to document
        document.head.appendChild(script)
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error loading maps API"))
      }
    }

    loadMapsApi()

    // Cleanup
    return () => {
      if (window[callback as keyof typeof window]) {
        delete window[callback as keyof typeof window]
      }
    }
  }, [callback, libraries, isLoaded])

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-700">Error loading maps: {error.message}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Loading maps...</span>
      </div>
    )
  }

  return <>{children}</>
}
