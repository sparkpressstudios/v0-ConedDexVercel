import type React from "react"
import type { Metadata, Viewport } from "next"
import { initEnvironment } from "./init-env"
import ClientRootLayout from "./client-layout"

// Initialize environment on server startup
initEnvironment().catch((error) => {
  console.error("Environment initialization failed:", error)
})

export const metadata: Metadata = {
  title: "ConeDex - Ice Cream Explorer",
  description: "Discover and track your ice cream adventure with ConeDex. The ultimate platform for ice cream lovers.",
  manifest: "/manifest.json",
  icons: [
    { rel: "icon", url: "/icons/icon-192x192.png" },
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
  ],
    generator: 'v0.dev'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#ffffff",
  viewportFit: "cover",
}

export const dynamic = "force-dynamic"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientRootLayout>{children}</ClientRootLayout>
}


import './globals.css'