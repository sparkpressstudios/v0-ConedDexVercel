export const dynamic = "force-dynamic"

import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import type React from "react"
import { checkEnvironmentVariables } from "@/lib/utils/env-validator"
import ClientLayout from "./client-layout"
import { initEnvironment } from "./init-env"
import { AnalyticsTracker } from "@/components/analytics/analytics-tracker"
import Script from "next/script"
import { Suspense } from "react"

// Initialize environment on server startup
initEnvironment()

const inter = Inter({ subsets: ["latin"] })

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
  // Correctly specify mobile web app capable
  viewportFit: "cover",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Add both modern and legacy meta tags for compatibility */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <Suspense fallback={<div>Loading...</div>}>
            <ClientLayout>{children}</ClientLayout>
          </Suspense>
        </ThemeProvider>
        <AnalyticsTracker />
        <Script id="sw-register" src="/sw-register.js" strategy="lazyOnload" />
      </body>
    </html>
  )
}
