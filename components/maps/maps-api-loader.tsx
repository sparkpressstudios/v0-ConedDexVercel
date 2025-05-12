"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Script from "next/script"

interface MapsApiLoaderProps {
  children: React.ReactNode
  libraries?: string[]
  callback?: string
}

export default function MapsApiLoader({ children, libraries = ["places"], callback = "initMap" }: MapsApiLoaderProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [scriptSrc, setScriptSrc] = useState("")
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

    // Get the script URL from our API
    const fetchScriptUrl = async () => {
      try {
        const librariesParam = libraries.join(",")
        const response = await fetch(`/api/maps/loader?libraries=${librariesParam}`)
        const data = await response.json()

        if (data.error) {
          setError(data.error)
          return
        }

        setScriptSrc(data.apiUrl)
      } catch (err) {
        setError("Failed to get Maps API URL")
        console.error("Error fetching Maps API URL:", err)
      }
    }

    fetchScriptUrl()

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
      {scriptSrc && (
        <Script
          src={scriptSrc}
          strategy="afterInteractive"
          onError={() => setError("Failed to load Google Maps API")}
        />
      )}
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
