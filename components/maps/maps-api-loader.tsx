"use client"

import { useEffect, useState } from "react"

interface MapsApiLoaderProps {
  onLoad?: () => void
  onError?: (error: Error) => void
}

export function MapsApiLoader({ onLoad, onError }: MapsApiLoaderProps) {
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    // Create a script element to load our proxy script
    const script = document.createElement("script")
    script.src = "/api/maps/loader"
    script.async = true
    script.defer = true

    // Set up event handlers
    script.onload = () => {
      setLoaded(true)
      if (onLoad) onLoad()
    }

    script.onerror = (e) => {
      const err = new Error("Failed to load Google Maps API")
      setError(err)
      if (onError) onError(err)
    }

    // Add the script to the document
    document.head.appendChild(script)

    // Clean up
    return () => {
      document.head.removeChild(script)
    }
  }, [onLoad, onError])

  return null
}
