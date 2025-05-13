import type React from "react"
import { checkEnvironmentVariables } from "@/lib/utils/env-validator"
import ClientLayout from "./client-layout"
import { initEnvironment } from "./init-env"

// Initialize environment checks - server actions must be awaited
if (typeof window === "undefined") {
  // We can't use await at the top level in a module, so we use a self-invoking async function
  ;(async () => {
    try {
      await initEnvironment()
    } catch (error) {
      console.error("Environment initialization failed:", error)
    }
  })()

  // Also run the direct check for redundancy
  checkEnvironmentVariables()
}

export const metadata = {
  title: "ConeDex - Discover and Track Ice Cream Experiences",
  description: "Find, log, and share your ice cream adventures with ConeDex.",
  manifest: "/manifest.json",
  themeColor: "#ffffff",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "ConeDex",
  },
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}


import './globals.css'