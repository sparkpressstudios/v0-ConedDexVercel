import type React from "react"
import { IceCream, MapPin, Award, Users, Search, Store } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Features</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Discover all the ways ConeDex helps you explore and enjoy ice cream
        </p>
      </div>

      <div className="space-y-24">
        {/* Feature Section 1 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <Search className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Discover Ice Cream Shops</h2>
            <p className="mb-6 text-lg text-gray-600">
              Find the best ice cream shops near you or in any location you're planning to visit. Our comprehensive
              database includes shops of all sizes, from small local parlors to popular chains.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>Search by location, flavor, or rating</FeatureListItem>
              <FeatureListItem>View detailed shop profiles with photos and information</FeatureListItem>
              <FeatureListItem>Read authentic reviews from other ice cream enthusiasts</FeatureListItem>
              <FeatureListItem>Filter by dietary preferences (vegan, dairy-free, etc.)</FeatureListItem>
            </ul>
          </div>
          <div className="relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img src="/ice-cream-search-ui.png" alt="Shop discovery interface" className="rounded-lg shadow-lg" />
          </div>
        </div>

        {/* Feature Section 2 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1 relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img src="/flavor-tracker-interface.png" alt="Flavor logging interface" className="rounded-lg shadow-lg" />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <IceCream className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Log Your Flavor Adventures</h2>
            <p className="mb-6 text-lg text-gray-600">
              Keep track of every ice cream flavor you try. Rate, review, and remember your favorites with our
              easy-to-use logging system.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>Log flavors with ratings, photos, and notes</FeatureListItem>
              <FeatureListItem>Track your flavor history over time</FeatureListItem>
              <FeatureListItem>Discover your personal taste preferences</FeatureListItem>
              <FeatureListItem>Get personalized flavor recommendations</FeatureListItem>
            </ul>
          </div>
        </div>

        {/* Feature Section 3 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <Award className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Earn Badges and Achievements</h2>
            <p className="mb-6 text-lg text-gray-600">
              Make your ice cream journey more exciting with our gamified experience. Complete challenges and earn
              badges as you explore new flavors and shops.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>Unlock badges for trying new flavors and visiting shops</FeatureListItem>
              <FeatureListItem>Complete special challenges and seasonal quests</FeatureListItem>
              <FeatureListItem>Track your progress on your profile</FeatureListItem>
              <FeatureListItem>Compete with friends on leaderboards</FeatureListItem>
            </ul>
          </div>
          <div className="relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img src="/sweet-treat-rewards.png" alt="Badges and achievements" className="rounded-lg shadow-lg" />
          </div>
        </div>

        {/* Feature Section 4 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1 relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img
              src="/neighborhood-ice-cream-map.png"
              alt="Interactive map interface"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <MapPin className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Interactive Maps</h2>
            <p className="mb-6 text-lg text-gray-600">
              Visualize ice cream shops on an interactive map to plan your adventures. Find hidden gems in your area or
              discover shops while traveling.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>View shops on a responsive, interactive map</FeatureListItem>
              <FeatureListItem>Filter map results by rating, distance, or flavor availability</FeatureListItem>
              <FeatureListItem>Save favorite locations for future visits</FeatureListItem>
              <FeatureListItem>Get directions to shops from your current location</FeatureListItem>
            </ul>
          </div>
        </div>

        {/* Feature Section 5 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <Users className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Join Teams and Communities</h2>
            <p className="mb-6 text-lg text-gray-600">
              Connect with other ice cream enthusiasts. Create or join teams to share experiences, compete in
              challenges, and discover new flavors together.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>Create or join teams with friends and family</FeatureListItem>
              <FeatureListItem>Participate in team challenges and competitions</FeatureListItem>
              <FeatureListItem>Share discoveries and recommendations</FeatureListItem>
              <FeatureListItem>Plan group ice cream outings</FeatureListItem>
            </ul>
          </div>
          <div className="relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img src="/ice-cream-social-fun.png" alt="Teams and communities" className="rounded-lg shadow-lg" />
          </div>
        </div>

        {/* Feature Section 6 */}
        <div className="grid gap-16 md:grid-cols-2">
          <div className="order-2 md:order-1 relative rounded-lg bg-gray-100 p-6 shadow-inner">
            <img
              src="/placeholder.svg?height=400&width=600&query=ice cream shop management dashboard"
              alt="Shop management dashboard"
              className="rounded-lg shadow-lg"
            />
          </div>
          <div className="order-1 md:order-2 flex flex-col justify-center">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <Store className="h-6 w-6" />
            </div>
            <h2 className="mb-4 text-3xl font-bold">Shop Management Tools</h2>
            <p className="mb-6 text-lg text-gray-600">
              For shop owners, ConeDex provides powerful tools to manage your shop profile, showcase your flavors, and
              engage with customers.
            </p>
            <ul className="space-y-3">
              <FeatureListItem>Claim and manage your shop profile</FeatureListItem>
              <FeatureListItem>Update flavor availability in real-time</FeatureListItem>
              <FeatureListItem>Respond to customer reviews</FeatureListItem>
              <FeatureListItem>Access analytics and insights about your customers</FeatureListItem>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function FeatureListItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start">
      <div className="mr-3 mt-1">
        <svg
          className="h-5 w-5 text-green-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      </div>
      <span>{children}</span>
    </li>
  )
}
