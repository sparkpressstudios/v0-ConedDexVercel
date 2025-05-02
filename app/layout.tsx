import type React from "react"
import { checkEnvironmentVariables } from "@/lib/utils/env-validator"
import ClientLayout from "./client-layout"

// Check environment variables during server rendering
if (typeof window === "undefined") {
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