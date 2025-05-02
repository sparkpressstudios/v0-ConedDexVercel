import type React from "react"
import Head from "next/head"
import Link from "next/link"

interface PagesLayoutProps {
  children: React.ReactNode
  title: string
  description?: string
}

export function PagesLayout({ children, title, description }: PagesLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>{title} | ConeDex</title>
        {description && <meta name="description" content={description} />}
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">ConeDex</h1>
          <nav className="space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              Home
            </Link>
            <Link href="/about" className="text-blue-600 hover:text-blue-800">
              About
            </Link>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800">
              Profile
            </Link>
          </nav>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}
