import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowRight, IceCream, MapPin, Award, Users, Search, Store } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PublicHeader } from "@/components/layout/public-header"
import { PublicFooter } from "@/components/layout/public-footer"

export default async function RootPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-pink-50 to-white py-20 md:py-32">
          <div className="container relative z-10 mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-6xl">
                Discover and Track the Best <span className="text-pink-600">Ice Cream</span> Experiences
              </h1>
              <p className="mb-10 text-xl text-gray-600">
                ConeDex is your ultimate companion for finding, logging, and sharing ice cream adventures. Join our
                community of flavor explorers today!
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/signup">
                    Get Started <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/shops">Explore Shops</Link>
                </Button>
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

        {/* CTA Section */}
        <section className="bg-pink-600 py-20 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Start Your Ice Cream Journey?</h2>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-pink-100">
              Join thousands of ice cream enthusiasts and businesses on ConeDex today.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="lg" variant="secondary" className="gap-2">
                <Link href="/signup">
                  Sign Up Now <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="bg-transparent text-white hover:bg-pink-700">
                <Link href="/login">Log In</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <PublicFooter />
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <Card className="border-0 shadow-md transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}
