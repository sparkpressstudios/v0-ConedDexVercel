import Link from "next/link"
import Head from "next/head"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>ConeDex - Home</title>
        <meta name="description" content="ConeDex - Track Your Ice Cream Adventures" />
      </Head>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Welcome to ConeDex</h1>
        <p className="mb-4">This is a simple page that doesn't import any complex components.</p>
        <div className="mt-8">
          <Link href="/app" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
            Go to App
          </Link>
        </div>
      </main>
    </div>
  )
}
