import Link from "next/link"
import Image from "next/image"
import { Store, ChevronRight, BarChart, Users, MessageSquare, Zap, Check, Star, Target } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function BusinessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20 md:py-28">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2">
            <div className="flex flex-col justify-center">
              <Badge className="mb-4 w-fit bg-blue-100 text-blue-800 hover:bg-blue-200">For Ice Cream Businesses</Badge>
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
                Grow Your Ice Cream Business with ConeDex
              </h1>
              <p className="mb-8 text-lg text-gray-600">
                Connect with ice cream enthusiasts, manage your shop profile, and increase visibility with our business
                tools.
              </p>
              <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <Button asChild size="lg" className="gap-2 bg-blue-600 hover:bg-blue-700">
                  <Link href="/business/claim">
                    Claim Your Shop <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/pricing">View Pricing</Link>
                </Button>
              </div>
              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/smiling-scoops-owner.png"
                      alt="Shop owner"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/friendly-shopkeeper.png"
                      alt="Shop owner"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="h-8 w-8 overflow-hidden rounded-full border-2 border-white">
                    <Image
                      src="/confident-startup-founder.png"
                      alt="Shop owner"
                      width={32}
                      height={32}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">2,500+</span> businesses trust ConeDex
                </div>
              </div>
            </div>
            <div className="relative flex items-center justify-center">
              <div className="relative h-[400px] w-[400px] overflow-hidden rounded-full bg-blue-100">
                <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-blue-300 opacity-50"></div>
                <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-green-300 opacity-50"></div>
                <Image src="/smiling-scoops-owner.png" alt="Ice cream shop owner" fill className="object-cover p-8" />
              </div>
              <div className="absolute -right-4 bottom-12 rounded-lg bg-white p-4 shadow-lg md:right-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Star className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">New Review!</div>
                    <div className="text-xs text-gray-500">★★★★★ "Amazing flavors!"</div>
                  </div>
                </div>
              </div>
              <div className="absolute -left-4 top-12 rounded-lg bg-white p-4 shadow-lg md:left-0">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Customer Insights</div>
                    <div className="text-xs text-gray-500">+15% new visitors this week</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-green-100 text-green-800 hover:bg-green-200">Benefits</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Why Join ConeDex?</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Our platform offers unique benefits for ice cream shops and businesses
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            <BenefitCard
              icon={<Users className="h-10 w-10 text-blue-600" />}
              title="Reach New Customers"
              description="Connect with thousands of ice cream enthusiasts actively looking for new shops and flavors to try."
            />
            <BenefitCard
              icon={<BarChart className="h-10 w-10 text-blue-600" />}
              title="Valuable Insights"
              description="Gain data on customer preferences, popular flavors, and trends to inform your business decisions."
            />
            <BenefitCard
              icon={<MessageSquare className="h-10 w-10 text-blue-600" />}
              title="Customer Engagement"
              description="Respond to reviews, announce new flavors, and build a loyal community around your brand."
            />
            <BenefitCard
              icon={<Store className="h-10 w-10 text-blue-600" />}
              title="Complete Shop Profile"
              description="Showcase your shop with photos, flavor listings, hours, and all the information customers need."
            />
            <BenefitCard
              icon={<Zap className="h-10 w-10 text-blue-600" />}
              title="Marketing Tools"
              description="Promote special events, seasonal flavors, and offers directly to interested customers."
            />
            <BenefitCard
              icon={<Target className="h-10 w-10 text-blue-600" />}
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
            <Badge className="mb-4 bg-purple-100 text-purple-800 hover:bg-purple-200">Pricing</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Simple, Transparent Pricing</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Choose the plan that best fits your business needs
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-gray-800 hover:bg-gray-900">
                  <Link href="/business/claim">Claim Your Shop</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ring-2 ring-blue-500">
              <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
                MOST POPULAR
              </div>
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
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full bg-blue-600 hover:bg-blue-700">
                  <Link href="/business/premium">Get Premium</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="flex h-full flex-col border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
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
                      <Check className="mr-2 h-5 w-5 text-green-500" />
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

          <div className="mt-8 text-center">
            <Link href="/pricing">
              <Button variant="link" className="text-blue-600">
                View detailed pricing and feature comparison
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-amber-100 text-amber-800 hover:bg-amber-200">Getting Started</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">How It Works</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Getting started with ConeDex is simple and straightforward
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-1 bg-blue-200 md:left-1/2 md:-ml-0.5"></div>

              <div className="space-y-12">
                <StepItem
                  number={1}
                  title="Claim Your Shop"
                  description="Search for your shop on ConeDex and claim it as the owner. If your shop isn't listed yet, you can add it."
                  isLeft={true}
                />

                <StepItem
                  number={2}
                  title="Verify Ownership"
                  description="Complete our simple verification process to confirm you're the legitimate owner or manager of the shop."
                  isLeft={false}
                />

                <StepItem
                  number={3}
                  title="Complete Your Profile"
                  description="Add photos, update your shop information, and list your available flavors to attract customers."
                  isLeft={true}
                />

                <StepItem
                  number={4}
                  title="Engage With Customers"
                  description="Respond to reviews, update your flavor inventory, and use our tools to build customer loyalty."
                  isLeft={false}
                />
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
              <Link href="/business/claim">Get Started Today</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-pink-100 text-pink-800 hover:bg-pink-200">Success Stories</Badge>
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

      {/* FAQ Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <Badge className="mb-4 bg-indigo-100 text-indigo-800 hover:bg-indigo-200">FAQ</Badge>
            <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">Frequently Asked Questions</h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600">
              Get answers to common questions about our business program
            </p>
          </div>

          <div className="mx-auto max-w-3xl">
            <Tabs defaultValue="eligibility" className="w-full">
              <TabsList className="grid w-full grid-cols-2 md:grid-cols-5">
                <TabsTrigger value="eligibility" className="text-xs md:text-sm">
                  Eligibility
                </TabsTrigger>
                <TabsTrigger value="pricing" className="text-xs md:text-sm">
                  Pricing
                </TabsTrigger>
                <TabsTrigger value="roi" className="text-xs md:text-sm">
                  ROI Measurement
                </TabsTrigger>
                <TabsTrigger value="timeline" className="text-xs md:text-sm">
                  Timeline
                </TabsTrigger>
                <TabsTrigger value="difference" className="text-xs md:text-sm">
                  Why ConeDex
                </TabsTrigger>
              </TabsList>
              <div className="mt-6 rounded-lg border p-6">
                <TabsContent value="eligibility">
                  <h3 className="mb-2 text-lg font-medium">What types of businesses can join ConeDex?</h3>
                  <p>
                    We welcome all ice cream shops, gelato parlors, frozen yogurt stores, and any business that serves
                    ice cream products. Whether you're a small local shop or a large chain, ConeDex is designed to help
                    you connect with customers.
                  </p>
                </TabsContent>
                <TabsContent value="pricing">
                  <h3 className="mb-2 text-lg font-medium">How much does it cost to join ConeDex?</h3>
                  <p>
                    You can get started for free with our Basic plan, which allows you to claim your shop and add up to
                    10 flavors. Our Premium plan at $19/month offers enhanced features like unlimited flavors,
                    promotional tools, and advanced analytics. For larger businesses with multiple locations, we offer
                    custom Enterprise solutions.
                  </p>
                </TabsContent>
                <TabsContent value="roi">
                  <h3 className="mb-2 text-lg font-medium">How do I measure ROI from ConeDex?</h3>
                  <p>
                    Our platform provides detailed analytics on profile views, customer engagement, and flavor
                    popularity. Premium and Enterprise plans include more advanced metrics like customer demographics
                    and conversion tracking. Many businesses report seeing new customers within the first month of
                    joining ConeDex.
                  </p>
                </TabsContent>
                <TabsContent value="timeline">
                  <h3 className="mb-2 text-lg font-medium">How long does it take to get set up?</h3>
                  <p>
                    The initial claim process takes just a few minutes. Verification typically takes 1-2 business days.
                    Once verified, you can immediately start updating your profile, adding flavors, and engaging with
                    customers. Most businesses complete their full profile setup within a week.
                  </p>
                </TabsContent>
                <TabsContent value="difference">
                  <h3 className="mb-2 text-lg font-medium">What makes ConeDex different from other platforms?</h3>
                  <p>
                    ConeDex is specifically designed for ice cream businesses and enthusiasts, creating a targeted
                    audience of potential customers. Our gamification features like badges and challenges drive user
                    engagement and shop visits. We also provide specialized tools for ice cream businesses that general
                    review platforms don't offer.
                  </p>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold md:text-4xl">Ready to Grow Your Ice Cream Business?</h2>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-blue-100">
            Join thousands of ice cream shops already using ConeDex to connect with customers and increase sales.
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" variant="secondary" className="gap-2 bg-white text-blue-600 hover:bg-gray-100">
              <Link href="/business/claim">
                Claim Your Shop <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white bg-transparent text-white hover:bg-white/10"
            >
              <Link href="/pricing">View Pricing</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}

function BenefitCard({ icon, title, description }) {
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

function StepItem({ number, title, description, isLeft }) {
  return (
    <div className="relative">
      <div className={`md:flex md:items-center ${isLeft ? "md:flex-row-reverse" : ""}`}>
        <div className="md:w-1/2"></div>
        <div className="flex md:w-1/2">
          <div className="z-10 flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-xl font-bold text-white shadow-lg mr-4 md:mx-auto">
            {number}
          </div>
          <div className="pt-1 md:hidden">
            <h3 className="mb-2 text-xl font-bold">{title}</h3>
            <p className="text-gray-600">{description}</p>
          </div>
        </div>
      </div>
      <div className={`hidden md:block md:w-1/2 md:px-8 ${isLeft ? "md:text-right" : ""}`}>
        <h3 className="mb-2 text-xl font-bold">{title}</h3>
        <p className="text-gray-600">{description}</p>
      </div>
    </div>
  )
}

function TestimonialCard({ quote, author, role, image }) {
  return (
    <Card className="border-0 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg">
      <CardContent className="p-6">
        <div className="mb-4">
          <svg
            className="h-8 w-8 text-blue-400"
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
