"use client"

import type React from "react"
import dynamic from "next/dynamic"

// Dynamically import the client-side maps loader with no SSR
const ClientMapsLoader = dynamic(() => import("./client-maps-loader"), { ssr: false })

interface MapsLoaderClientProps {
  libraries?: string[]
  callback?: string
  children: React.ReactNode
}

export function MapsLoaderClient({ libraries = ["places"], callback = "initMap", children }: MapsLoaderClientProps) {
  return (
    <ClientMapsLoader libraries={libraries} callback={callback}>
      {children}
    </ClientMapsLoader>
  )
}
