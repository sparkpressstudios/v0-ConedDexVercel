import Link from "next/link"
import Head from "next/head"

export default function Custom500() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Head>
        <title>500 - Server Error</title>
      </Head>
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4">500</h1>
        <p className="text-xl mb-8">Server Error</p>
        <Link href="/" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Go Home
        </Link>
      </div>
    </div>
  )
}
