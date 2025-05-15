import type React from "react"
import ClientLayout from "../client-layout"
import Link from "next/link"
import { IceCream } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClientLayout>
      <div className="flex min-h-screen flex-col">
        <header className="border-b bg-background h-16 flex items-center px-6">
          <Link href="/" className="flex items-center gap-2">
            <div className="rounded-full bg-purple-900 p-1">
              <IceCream className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold">ConeDex</span>
          </Link>
        </header>
        <main className="flex-1 flex items-center justify-center p-4 md:p-6">{children}</main>
      </div>
    </ClientLayout>
  )
}
