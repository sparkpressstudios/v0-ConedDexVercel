import { redirect } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, IceCream, MapPin, Award, Users, Search, Store, Star, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { Badge } from "@/components/ui/badge"

// Mark this page as dynamic to allow cookies usage
export const dynamic = "force-dynamic"

export default async function RootPage() {
  // Create the Supabase client directly in the component
  const supabase = createServerComponentClient<Database>({ cookies })

  let session = null
  try {
    const { data } = await supabase.auth.getSession()
    session = data.session
  } catch (error) {
    console.error("Error getting session:", error)
  }

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white py-20 md:py-28">
        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit bg-pink-100 text-pink-800 hover:bg-pink-200">
                The Ultimate Ice Cream Companion
              </Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
                Discover & Track <span className="text-pink-600">Ice Cream</span> Adventures
              </h1>
              <p className="mb-8 text-lg text-gray-600 md:text-xl">
                ConeDex helps you find new flavors, track your favorites, and connect with a community of ice cream
                enthusiasts.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2 bg-pink-600 hover:bg-pink-700">
                  <Link href="/signup">
                    Start Exploring <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/business">For Business Owners</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/confident-marketing-leader.png"
                      alt="User"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/focused-asian-pm.png"
                      alt="User"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/confident-indian-leader.png"
                      alt="User"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">10,000+</span> ice cream enthusiasts
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full bg-pink-100">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-pink-300 opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-blue-300 opacity-50"></div>
                <Image src="/colorful-ice-cream-cones.png" alt="Ice cream cones" fill className="object-cover p-8" />
              </div>
              <div className="absolute -right-4 bottom-12 rounded-lg bg-white p-4 shadow-lg md:right-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">New Badge Earned!</div>
                    <div className="text-xs text-gray-500">Flavor Explorer</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 top-12 rounded-lg bg-white p-4 shadow-lg md:left-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <MapPin className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">New Shop Nearby</div>
                    <div className="text-xs text-gray-500">Sweet Dreams Ice Cream</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute -right-40 -top-40 h-96 w-96 rounded-full bg-pink-200 opacity-20 blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-blue-200 opacity-20 blur-3xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Features</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How ConeDex Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Your personal ice cream passport and discovery platform all in one place
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Search className="h-10 w-10 text-pink-600" />}
              title="Discover Shops"
              description="Find ice cream shops near you or in any location you're visiting."
            />
            <FeatureCard
              icon={<IceCream className="h-10 w-10 text-pink-600" />}
              title="Log Flavors"
              description="Keep track of every flavor you try and rate your experiences."
            />
            <FeatureCard
              icon={<Award className="h-10 w-10 text-pink-600" />}
              title="Earn Badges"
              description="Complete challenges and earn badges as you explore new flavors and shops."
            />
            <FeatureCard
              icon={<Users className="h-10 w-10 text-pink-600" />}
              title="Join Teams"
              description="Create or join teams to compete and share experiences with friends."
            />
            <FeatureCard
              icon={<MapPin className="h-10 w-10 text-pink-600" />}
              title="Interactive Maps"
              description="Visualize shops on an interactive map to plan your ice cream adventures."
            />
            <FeatureCard
              icon={<Store className="h-10 w-10 text-pink-600" />}
              title="Shop Management"
              description="Shop owners can claim and manage their shop profiles and flavor listings."
            />
          </div>
        </div>
      </section>

      {/* User Types Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">For Everyone</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Choose Your ConeDex Experience</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Whether you're an ice cream enthusiast or a business owner, ConeDex has something for you
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            <Card className="overflow-hidden border-0 shadow-lg transition-all duration-200 hover:shadow-xl">
              <div className="h-3 bg-pink-500"></div>
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
                  <IceCream className="h-8 w-8 text-pink-600" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Ice Cream Explorers</h3>
                <p className="mb-6 text-gray-600">
                  For ice cream enthusiasts who want to discover new flavors, track their experiences, and connect with
                  other fans.
                </p>
                <ul className="mb-8 space-y-3">
                  <BenefitItem>Find new shops and flavors</BenefitItem>
                  <BenefitItem>Track your ice cream adventures</BenefitItem>
                  <BenefitItem>Earn badges and join challenges</BenefitItem>
                  <BenefitItem>Connect with other enthusiasts</BenefitItem>
                </ul>
                <Button asChild className="w-full bg-pink-600 hover:bg-pink-700">
                  <Link href="/signup">Sign Up as Explorer</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="overflow-hidden border-0 shadow-lg transition-all duration-200 hover:shadow-xl">
              <div className="h-3 bg-blue-500"></div>
              <CardContent className="p-8">
                <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                  <Store className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="mb-4 text-2xl font-bold">Business Owners</h3>
                <p className="mb-6 text-gray-600">
                  For ice cream shops and businesses looking to increase visibility, engage with customers, and grow
                  their brand.
                </p>
                <ul className="mb-8 space-y-3">
                  <BenefitItem>Claim and manage your shop profile</BenefitItem>
                  <BenefitItem>Showcase your flavors and specialties</BenefitItem>
                  <BenefitItem>Engage with customer reviews</BenefitItem>
                  <BenefitItem>Access analytics and insights</BenefitItem>
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/business">Learn More</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">Testimonials</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">What Our Users Say</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Join thousands of ice cream enthusiasts and businesses already using ConeDex
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="ConeDex has completely changed how I discover ice cream. I've found amazing flavors I never would have tried otherwise!"
              author="Sarah Johnson"
              role="Ice Cream Explorer"
              image="/confident-marketing-leader.png"
            />
            <TestimonialCard
              quote="Since listing our shop on ConeDex, we've seen a 30% increase in new customers. The platform has been invaluable for our small business."
              author="Michael Chen"
              role="Shop Owner, Frosty Delights"
              image="/focused-asian-pm.png"
            />
            <TestimonialCard
              quote="I love competing with my friends to see who can discover the most unique flavors. The badges make it so much fun!"
              author="Aisha Patel"
              role="Team Leader, Scoop Squad"
              image="/confident-indian-leader.png"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-pink-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Start Your Ice Cream Journey?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-pink-100">
            Join thousands of ice cream enthusiasts and businesses on ConeDex today.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2 bg-white text-pink-600 hover:bg-gray-100">
              <Link href="/signup">
                Sign Up Now <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">{icon}</div>
        <h3 className="mb-2 text-xl font-medium">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </CardContent>
    </Card>
  )
}

function BenefitItem({ children }) {
  return (
    <li className="flex items-start">
      <div className="mr-3 mt-1">
        <Check className="h-5 w-5 text-green-500" />
      </div>
      <span>{children}</span>
    </li>
  )
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <Card className="border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <svg
            className="h-8 w-8 text-pink-400"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
          </svg>
        </div>
        <p className="mb-6 text-gray-700">{quote}</p>
        <div className="flex items-center">
          <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
            <Image
              src={image || "/placeholder.svg"}
              alt={author}
              width={48}
              height={48}
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{author}</p>
            <p className="text-sm text-gray-600">{role}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
