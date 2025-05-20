import type React from "react"
import "@/app/globals.css"
import type { Metadata } from "next"
import { fontSans, fontMono } from "@/lib/fonts"
import { cn } from "@/lib/utils"
import { ClientLayout } from "./client-layout"
import { Suspense } from "react"
import { Analytics } from "@vercel/analytics/react"

export const metadata: Metadata = {
  title: "ConeDex - Discover and Track Ice Cream Adventures",
  description: "Find new flavors, track your favorites, and connect with a community of ice cream enthusiasts.",
  icons: {
    icon: "/icons/icon-192x192.png",
    apple: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.json",
    generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={cn("min-h-screen bg-background font-sans antialiased", fontSans.variable, fontMono.variable)}>
        <ClientLayout>{children}</ClientLayout>
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>
      </body>
    </html>
  )
}
