import type React from "react"
import { MapsLoaderClient } from "./maps-loader-client"

interface MapsLoaderProps {
  libraries?: string[]
  callback?: string
  children: React.ReactNode
}

export function MapsLoader({ libraries = ["places"], callback = "initMap", children }: MapsLoaderProps) {
  return (
    <MapsLoaderClient libraries={libraries} callback={callback}>
      {children}
    </MapsLoaderClient>
  )
}

// Also export as default for backward compatibility
export default MapsLoader
