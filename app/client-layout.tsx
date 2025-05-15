"use client"

import type React from "react"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { Toaster } from "@/components/ui/toaster"
import Script from "next/script"
import { checkEnvironmentVariables } from "@/lib/utils/env-validator"
import { useEffect } from "react"

import "./globals.css"

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  // Client-side check for environment variables
  useEffect(() => {
    checkEnvironmentVariables()
  }, [])

  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="ConeDex" />
      </head>
      <body>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <SupabaseProvider>
            <AuthProvider>{children}</AuthProvider>
          </SupabaseProvider>
          <Toaster />
        </ThemeProvider>
        <Script
          id="service-worker-registration"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('ServiceWorker registration successful with scope: ', registration.scope);
                    })
                    .catch(function(err) {
                      console.error('ServiceWorker registration failed: ', err);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
