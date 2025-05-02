import Link from "next/link"
import { Store, ChevronRight, BarChart, Users, MessageSquare, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function BusinessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-gray-50 to-white py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Grow Your Ice Cream Business with ConeDex
              </h1>
              <p className="mb-8 text-xl text-gray-600">
                Connect with ice cream enthusiasts, manage your shop profile, and increase visibility with our business
                tools.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/business/claim">
                    Claim Your Shop <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <img src="/smiling-scoops-owner.png" alt="Ice cream shop owner" className="rounded-lg shadow-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Why Join ConeDex?</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our platform offers unique benefits for ice cream shops and businesses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<Users className="h-10 w-10 text-mint-600" />}
              title="Reach New Customers"
              description="Connect with thousands of ice cream enthusiasts actively looking for new shops and flavors to try."
            />
            <BenefitCard
              icon={<BarChart className="h-10 w-10 text-blueberry-600" />}
              title="Valuable Insights"
              description="Gain data on customer preferences, popular flavors, and trends to inform your business decisions."
            />
            <BenefitCard
              icon={<MessageSquare className="h-10 w-10 text-strawberry-600" />}
              title="Customer Engagement"
              description="Respond to reviews, announce new flavors, and build a loyal community around your brand."
            />
            <BenefitCard
              icon={<Store className="h-10 w-10 text-chocolate-600" />}
              title="Complete Shop Profile"
              description="Showcase your shop with photos, flavor listings, hours, and all the information customers need."
            />
            <BenefitCard
              icon={<Zap className="h-10 w-10 text-vanilla-600" />}
              title="Marketing Tools"
              description="Promote special events, seasonal flavors, and offers directly to interested customers."
            />
            <BenefitCard
              icon={<ChevronRight className="h-10 w-10 text-mint-600" />}
              title="Competitive Edge"
              description="Stand out from competitors by maintaining an active presence on the platform ice cream lovers use."
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Subscription Plans</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Choose the plan that best fits your business needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">Free</span>
                </div>
                <CardDescription className="mt-2">Get started with a basic shop profile</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2">
                  {[
                    "Basic shop profile",
                    "Add up to 10 flavors",
                    "Respond to customer reviews",
                    "Basic analytics dashboard",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gray-800 hover:bg-gray-900">
                  <Link href="/business/claim">Claim Your Shop</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:shadow-lg ring-2 ring-mint-500">
              <CardHeader>
                <CardTitle className="text-2xl">Premium</CardTitle>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">$19</span>
                  <span className="text-gray-500">/month</span>
                </div>
                <CardDescription className="mt-2">Enhanced visibility and marketing tools</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2">
                  {[
                    "Everything in Basic",
                    "Unlimited flavors",
                    "Featured in search results",
                    "Promotional announcements",
                    "Advanced analytics",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-mint-600 hover:bg-mint-700">
                  <Link href="/business/premium">Get Premium</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl">Enterprise</CardTitle>
                <div className="mt-2 flex items-baseline">
                  <span className="text-3xl font-bold">Custom</span>
                </div>
                <CardDescription className="mt-2">For chains and multiple locations</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-6 flex-1 space-y-2">
                  {[
                    "Everything in Premium",
                    "Multiple location management",
                    "API access",
                    "Dedicated support",
                    "Custom integrations",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <svg
                        className="mr-2 h-5 w-5 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gray-800 hover:bg-gray-900">
                  <Link href="/business/enterprise">Contact Sales</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Getting started with ConeDex is simple and straightforward
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-1 bg-blueberry-200 md:left-1/2 md:-ml-0.5"></div>

              <div className="space-y-12">
                <div className="relative">
                  <div className={`md:flex md:items-center ${true ? "md:flex-row-reverse" : ""}`}>
                    <div className="md:w-1/2"></div>
                    <div className="flex md:w-1/2">
                      <div className="z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-xl font-bold text-white shadow-lg mr-4 md:mx-auto">
                        1
                      </div>
                      <div className="pt-1 md:hidden">
                        <h3 className="mb-2 text-xl font-bold">Claim Your Shop</h3>
                        <p className="text-gray-600">
                          Search for your shop on ConeDex and claim it as the owner. If your shop isn't listed yet, you
                          can add it.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2 md:px-8 md:text-right">
                    <h3 className="mb-2 text-xl font-bold">Claim Your Shop</h3>
                    <p className="text-gray-600">
                      Search for your shop on ConeDex and claim it as the owner. If your shop isn't listed yet, you can
                      add it.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className={`md:flex md:items-center ${false ? "md:flex-row-reverse" : ""}`}>
                    <div className="md:w-1/2"></div>
                    <div className="flex md:w-1/2">
                      <div className="z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-xl font-bold text-white shadow-lg mr-4 md:mx-auto">
                        2
                      </div>
                      <div className="pt-1 md:hidden">
                        <h3 className="mb-2 text-xl font-bold">Verify Ownership</h3>
                        <p className="text-gray-600">
                          Complete our simple verification process to confirm you're the legitimate owner or manager of
                          the shop.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2 md:px-8">
                    <h3 className="mb-2 text-xl font-bold">Verify Ownership</h3>
                    <p className="text-gray-600">
                      Complete our simple verification process to confirm you're the legitimate owner or manager of the
                      shop.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className={`md:flex md:items-center ${true ? "md:flex-row-reverse" : ""}`}>
                    <div className="md:w-1/2"></div>
                    <div className="flex md:w-1/2">
                      <div className="z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-xl font-bold text-white shadow-lg mr-4 md:mx-auto">
                        3
                      </div>
                      <div className="pt-1 md:hidden">
                        <h3 className="mb-2 text-xl font-bold">Complete Your Profile</h3>
                        <p className="text-gray-600">
                          Add photos, update your shop information, and list your available flavors to attract
                          customers.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2 md:px-8 md:text-right">
                    <h3 className="mb-2 text-xl font-bold">Complete Your Profile</h3>
                    <p className="text-gray-600">
                      Add photos, update your shop information, and list your available flavors to attract customers.
                    </p>
                  </div>
                </div>

                <div className="relative">
                  <div className={`md:flex md:items-center ${false ? "md:flex-row-reverse" : ""}`}>
                    <div className="md:w-1/2"></div>
                    <div className="flex md:w-1/2">
                      <div className="z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-xl font-bold text-white shadow-lg mr-4 md:mx-auto">
                        4
                      </div>
                      <div className="pt-1 md:hidden">
                        <h3 className="mb-2 text-xl font-bold">Engage With Customers</h3>
                        <p className="text-gray-600">
                          Respond to reviews, update your flavor inventory, and use our tools to build customer loyalty.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="hidden md:block md:w-1/2 md:px-8">
                    <h3 className="mb-2 text-xl font-bold">Engage With Customers</h3>
                    <p className="text-gray-600">
                      Respond to reviews, update your flavor inventory, and use our tools to build customer loyalty.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-mint-600 hover:bg-mint-700">
              <Link href="/business/claim">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">What Shop Owners Say</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">Hear from businesses that have grown with ConeDex</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <TestimonialCard
              quote="Since joining ConeDex, we've seen a 30% increase in new customers. The platform has been invaluable for our small shop."
              author="Sarah Johnson"
              role="Owner, Sweet Dreams Ice Cream"
              image="/smiling-shopkeeper.png"
            />
            <TestimonialCard
              quote="The analytics tools help us understand which flavors are trending and what our customers are looking for. It's changed how we plan our menu."
              author="Michael Chen"
              role="Manager, Frosty Delights"
              image="/friendly-shopkeeper.png"
            />
            <TestimonialCard
              quote="As a new shop, ConeDex helped us get discovered by ice cream enthusiasts in our area. The claim process was simple and the results were immediate."
              author="Aisha Patel"
              role="Founder, Scoop Haven"
              image="/confident-startup-founder.png"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blueberry-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Grow Your Ice Cream Business?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blueberry-100">
            Join thousands of ice cream shops already using ConeDex to connect with customers and increase sales.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2 bg-mint-500 hover:bg-mint-600">
              <Link href="/business/claim">
                Claim Your Shop <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="bg-transparent text-white hover:bg-blueberry-700">
              <Link href="/business/learn-more">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({ icon, title, description }) {
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

function StepItem({ number, title, description, isLeft }) {
  return (
    <div className="relative mb-12 md:mb-24">
      <div
        className={`flex ${
          isLeft
            ? "md:flex-row-reverse md:ml-auto md:mr-0 md:pr-0 md:pl-8 md:text-right"
            : "md:flex-row md:ml-0 md:mr-auto md:pl-0 md:pr-8"
        }`}
      >
        <div
          className={`z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-mint-500 text-xl font-bold text-white shadow-lg mr-4`}
        >
          {number}
        </div>
        <div className="md:max-w-xs">
          <h3 className="mb-2 text-xl font-bold">{title}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <Card className="border-0 shadow-md">
      <CardContent className="p-6">
        <div className="mb-4">
          <svg
            className="h-8 w-8 text-blueberry-400"
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
            <img src={image || "/placeholder.svg"} alt={author} className="h-full w-full object-cover" />
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
