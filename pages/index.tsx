"use client"
import { useRouter } from "next/router"
import Head from "next/head"
import Link from "next/link"

export default function Home() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ConeDex - Track Your Ice Cream Adventures</title>
        <meta name="description" content="Track and discover ice cream flavors with ConeDex" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">ConeDex</h1>
          <div>
            <Link href="/profile" className="text-blue-600 hover:text-blue-800 mr-4">
              Profile
            </Link>
          </div>
        </div>
      </header>

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-2xl font-semibold mb-4">Welcome to ConeDex</h2>
                <p className="mb-6">The ultimate platform for ice cream enthusiasts</p>
                <div className="flex justify-center space-x-4">
                  <Link
                    href="/profile"
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Go to Profile
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
