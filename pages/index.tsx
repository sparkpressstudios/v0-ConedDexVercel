import { PagesLayout } from "../components/pages-layout"
import Link from "next/link"

export default function Home() {
  return (
    <PagesLayout title="Home" description="Track Your Ice Cream Adventures with ConeDex">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Welcome to ConeDex</h2>
              <p className="mb-6">The ultimate platform for ice cream enthusiasts</p>
              <div className="flex justify-center space-x-4">
                <Link href="/profile" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                  Go to Profile
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PagesLayout>
  )
}
