import { PagesLayout } from "../components/pages-layout"

export default function About() {
  return (
    <PagesLayout title="About" description="Learn about ConeDex, the ultimate ice cream tracking platform">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white px-4 py-5 border-b border-gray-200 sm:px-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Our Mission</h2>
          <p className="mb-4">
            ConeDex is dedicated to helping ice cream enthusiasts discover, track, and share their favorite flavors. Our
            platform connects ice cream lovers with local shops and provides tools for shop owners to engage with their
            customers.
          </p>
          <h2 className="text-xl font-semibold text-gray-800 mb-4 mt-6">Features</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>Track ice cream flavors you've tried</li>
            <li>Discover new shops and flavors</li>
            <li>Connect with other ice cream enthusiasts</li>
            <li>Earn badges and climb the leaderboard</li>
            <li>For shop owners: manage your shop profile and engage with customers</li>
          </ul>
        </div>
      </div>
    </PagesLayout>
  )
}
