"use client"

import type React from "react"

import { useEffect, useState } from "react"
import Script from "next/script"

interface MapsLoaderProps {
  children: React.ReactNode
}

export default function ClientMapsLoader({ children }: MapsLoaderProps) {
  const [mapsLoaded, setMapsLoaded] = useState(false)

  useEffect(() => {
    // Check if Maps API is already loaded
    if (typeof window !== "undefined" && window.google && window.google.maps) {
      setMapsLoaded(true)
    }
  }, [])

  const handleMapsLoaded = () => {
    setMapsLoaded(true)
  }

  return (
    <>
      {!mapsLoaded && <Script src={`/api/maps/loader`} onLoad={handleMapsLoaded} strategy="afterInteractive" />}
      {mapsLoaded ? (
        children
      ) : (
        <div className="animate-pulse flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="h-12 w-12 bg-muted rounded-full"></div>
          <div className="h-4 w-36 bg-muted rounded"></div>
          <div className="text-sm text-muted-foreground">Loading maps...</div>
        </div>
      )}
    </>
  )
}
