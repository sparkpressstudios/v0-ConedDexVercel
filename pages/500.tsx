import Head from "next/head"
import Link from "next/link"

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>500 - Server Error | ConeDex</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">500</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! Something went wrong on our server.</p>
        <Link
          href="/"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}
