"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

interface ClientMapsLoaderProps {
  libraries?: string[]
  callback?: string
  children: React.ReactNode
}

export default function ClientMapsLoader({
  libraries = ["places"],
  callback = "initMap",
  children,
}: ClientMapsLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    const loadMapsApi = async () => {
      try {
        // Define the callback function
        window[callback as keyof typeof window] = () => {
          setIsLoaded(true)
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
      <div className={isLoaded ? "block" : "hidden"}>{children}</div>
    </>
  )
}
