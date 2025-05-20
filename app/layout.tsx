import type React from "react"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import "./globals.css"
import { ClientLayout } from "./client-layout"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { SupabaseProvider } from "@/components/providers/supabase-provider"
import { QueryProvider } from "@/components/providers/query-provider"
import { Toaster } from "@/components/ui/toaster"
import { lib } from "@/lib/fonts"

export const dynamic = "force-dynamic"

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // Create the Supabase client directly in the component
  const supabase = createServerComponentClient<Database>({ cookies })

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Error getting session:", error)
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lib.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <SupabaseProvider session={session}>
            <QueryProvider>
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
            </QueryProvider>
          </SupabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

export const metadata = {
      generator: 'v0.dev'
    };
