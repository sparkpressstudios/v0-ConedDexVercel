import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { IceCream, MapPin, Award, Users, Search, Store, Star, ChevronRight, Zap, Bell, BarChart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function FeaturesPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <Badge className="mb-4 bg-pink-100 text-pink-800 hover:bg-pink-200">Features</Badge>
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Discover ConeDex Features</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Explore all the ways ConeDex helps you discover, track, and enjoy ice cream
        </p>
      </div>

      <Tabs defaultValue="explorers" className="mb-16">
        <div className="flex justify-center">
          <TabsList className="mb-8">
            <TabsTrigger value="explorers" className="px-8">
              For Ice Cream Lovers
            </TabsTrigger>
            <TabsTrigger value="businesses" className="px-8">
              For Businesses
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="explorers">
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
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-pink-600 hover:bg-pink-700">
                    <Link href="/shops">
                      Explore Shops <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg bg-gradient-to-br from-pink-50 to-pink-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image src="/ice-cream-search-ui.png" alt="Shop discovery interface" fill className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-pink-100">
                      <MapPin className="h-5 w-5 text-pink-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">New Shop Found!</div>
                      <div className="text-xs text-gray-500">Just 0.5 miles away</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Section 2 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="order-2 md:order-1 relative rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/flavor-tracker-interface.png"
                    alt="Flavor logging interface"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <Star className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Flavor Logged!</div>
                      <div className="text-xs text-gray-500">★★★★★ Mint Chocolate Chip</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
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
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Link href="/signup">
                      Start Logging Flavors <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Section 3 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
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
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Link href="/badges">
                      View Badges <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image src="/sweet-treat-rewards.png" alt="Badges and achievements" fill className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Badge Earned!</div>
                      <div className="text-xs text-gray-500">Flavor Explorer - Level 2</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Section 4 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="order-2 md:order-1 relative rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/neighborhood-ice-cream-map.png"
                    alt="Interactive map interface"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <MapPin className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Route Planned</div>
                      <div className="text-xs text-gray-500">3 shops, 2.5 miles total</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <MapPin className="h-6 w-6" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Interactive Maps</h2>
                <p className="mb-6 text-lg text-gray-600">
                  Visualize ice cream shops on an interactive map to plan your adventures. Find hidden gems in your area
                  or discover shops while traveling.
                </p>
                <ul className="space-y-3">
                  <FeatureListItem>View shops on a responsive, interactive map</FeatureListItem>
                  <FeatureListItem>Filter map results by rating, distance, or flavor availability</FeatureListItem>
                  <FeatureListItem>Save favorite locations for future visits</FeatureListItem>
                  <FeatureListItem>Get directions to shops from your current location</FeatureListItem>
                </ul>
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                    <Link href="/shops/map">
                      Explore Map <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Feature Section 5 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
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
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-purple-600 hover:bg-purple-700">
                    <Link href="/teams">
                      Join a Team <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg bg-gradient-to-br from-purple-50 to-purple-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image src="/ice-cream-social-fun.png" alt="Teams and communities" fill className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                      <Users className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Team Challenge</div>
                      <div className="text-xs text-gray-500">Your team is in 2nd place!</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="businesses">
          <div className="space-y-24">
            {/* Business Feature Section 1 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  <Store className="h-6 w-6" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Shop Management Tools</h2>
                <p className="mb-6 text-lg text-gray-600">
                  Take control of your shop's presence on ConeDex with our comprehensive management tools designed
                  specifically for ice cream businesses.
                </p>
                <ul className="space-y-3">
                  <FeatureListItem>Claim and manage your shop profile</FeatureListItem>
                  <FeatureListItem>Update flavor availability in real-time</FeatureListItem>
                  <FeatureListItem>Respond to customer reviews</FeatureListItem>
                  <FeatureListItem>Showcase your shop with photos and detailed information</FeatureListItem>
                </ul>
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-blue-600 hover:bg-blue-700">
                    <Link href="/business/claim">
                      Claim Your Shop <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image
                    src="/ice-cream-dashboard.png"
                    alt="Shop management dashboard"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                      <IceCream className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Flavor Updated</div>
                      <div className="text-xs text-gray-500">Seasonal specials added</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Business Feature Section 2 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="order-2 md:order-1 relative rounded-lg bg-gradient-to-br from-green-50 to-green-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image src="/ice-cream-analytics-dashboard.png" alt="Analytics dashboard" fill className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <BarChart className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Trending Insight</div>
                      <div className="text-xs text-gray-500">Mint flavors up 15% this week</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2 flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <BarChart className="h-6 w-6" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Business Analytics</h2>
                <p className="mb-6 text-lg text-gray-600">
                  Gain valuable insights into your customers' preferences and behavior with our comprehensive analytics
                  tools.
                </p>
                <ul className="space-y-3">
                  <FeatureListItem>Track profile views and customer engagement</FeatureListItem>
                  <FeatureListItem>Analyze flavor popularity and trends</FeatureListItem>
                  <FeatureListItem>Understand customer demographics and preferences</FeatureListItem>
                  <FeatureListItem>Make data-driven decisions for your business</FeatureListItem>
                </ul>
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-green-600 hover:bg-green-700">
                    <Link href="/business">
                      Learn More <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Business Feature Section 3 */}
            <div className="grid gap-16 md:grid-cols-2">
              <div className="flex flex-col justify-center">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                  <Bell className="h-6 w-6" />
                </div>
                <h2 className="mb-4 text-3xl font-bold">Marketing and Promotions</h2>
                <p className="mb-6 text-lg text-gray-600">
                  Promote your shop and special offerings directly to ice cream enthusiasts who are actively looking for
                  new experiences.
                </p>
                <ul className="space-y-3">
                  <FeatureListItem>Announce new flavors and seasonal specials</FeatureListItem>
                  <FeatureListItem>Create and promote special events</FeatureListItem>
                  <FeatureListItem>Highlight your shop in search results</FeatureListItem>
                  <FeatureListItem>Reach customers based on their preferences</FeatureListItem>
                </ul>
                <div className="mt-8">
                  <Button asChild className="gap-2 bg-amber-600 hover:bg-amber-700">
                    <Link href="/pricing">
                      View Pricing <ChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="relative rounded-lg bg-gradient-to-br from-amber-50 to-amber-100 p-6 shadow-inner">
                <div className="relative h-[400px] w-full overflow-hidden rounded-lg shadow-lg">
                  <Image src="/ice-cream-marketing-dashboard.png" alt="Marketing tools" fill className="object-cover" />
                </div>
                <div className="absolute -bottom-6 -right-6 rounded-lg bg-white p-4 shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <Zap className="h-5 w-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Promotion Active</div>
                      <div className="text-xs text-gray-500">125 customers notified</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Mobile App Section */}
      <section className="mb-20 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 p-8 text-white md:p-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="flex flex-col justify-center">
            <Badge className="mb-4 w-fit bg-white/20 text-white hover:bg-white/30">Mobile App</Badge>
            <h2 className="mb-4 text-3xl font-bold">Take ConeDex Everywhere</h2>
            <p className="mb-6 text-lg text-pink-100">
              Our mobile app lets you discover and log ice cream flavors on the go. Available for iOS and Android
              devices.
            </p>
            <ul className="mb-8 space-y-3">
              <li className="flex items-start">
                <div className="mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-pink-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-pink-100">Log flavors even when offline</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-pink-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-pink-100">Get notifications about new shops and flavors nearby</span>
              </li>
              <li className="flex items-start">
                <div className="mr-3 mt-1">
                  <svg
                    className="h-5 w-5 text-pink-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <span className="text-pink-100">Share your discoveries instantly with friends</span>
              </li>
            </ul>
            <div className="flex flex-wrap gap-4">
              <Button asChild variant="secondary" size="lg">
                <Link href="#">
                  <Image src="/app-store-badge.png" alt="Download on App Store" width={140} height={42} />
                </Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="#">
                  <Image src="/google-play-badge.png" alt="Get it on Google Play" width={140} height={42} />
                </Link>
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-center">
            <div className="relative h-[500px] w-[250px]">
              <Image
                src="/placeholder.svg?height=500&width=250&query=mobile app showing ice cream shop discovery and flavor logging features"
                alt="ConeDex mobile app"
                fill
                className="object-cover rounded-3xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="rounded-xl bg-gray-50 p-8 text-center md:p-12">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Ready to start your ice cream journey?</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600">
          Join thousands of ice cream enthusiasts and businesses on ConeDex today.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="gap-2 bg-pink-600 hover:bg-pink-700">
            <Link href="/signup">
              Sign Up Now <ChevronRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/business">For Businesses</Link>
          </Button>
        </div>
      </section>
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
