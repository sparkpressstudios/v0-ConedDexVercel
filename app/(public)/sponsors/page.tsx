import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Award, Target, BarChart, Users, Star, Calendar, CheckCircle2, Zap, Globe, Store } from "lucide-react"

export default function SponsorsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="mb-16 text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900 md:text-5xl">Business Sponsorships & Partnerships</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Connect with ice cream enthusiasts through engaging partnerships with ConeDex, the gamified ice cream
          discovery platform loved by food adventurers everywhere.
        </p>
      </div>

      {/* Hero Stats */}
      <div className="mb-16 grid gap-6 md:grid-cols-3">
        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-strawberry-50 to-strawberry-100 p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-strawberry-500 opacity-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-strawberry-100 text-strawberry-600 transition-all group-hover:bg-strawberry-200">
              <Users className="h-7 w-7" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-strawberry-700">Community Engagement</h3>
            <p className="text-3xl font-bold text-strawberry-600 transition-all group-hover:scale-110">78%</p>
            <p className="text-gray-700">higher engagement rate</p>
            <div className="mt-3 text-sm text-gray-600 opacity-0 transition-all group-hover:opacity-100">
              <p>Compared to traditional food advertising platforms</p>
            </div>
            <div className="mt-3 opacity-0 transition-all group-hover:opacity-100">
              <Button variant="link" size="sm" className="text-strawberry-600">
                View engagement metrics
              </Button>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-strawberry-50 to-strawberry-100 p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-strawberry-500 opacity-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-strawberry-100 text-strawberry-600 transition-all group-hover:bg-strawberry-200">
              <BarChart className="h-7 w-7" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-strawberry-700">Investment Return</h3>
            <p className="text-3xl font-bold text-strawberry-600 transition-all group-hover:scale-110">3.5x</p>
            <p className="text-gray-700">average ROI for sponsors</p>
            <div className="mt-3 text-sm text-gray-600 opacity-0 transition-all group-hover:opacity-100">
              <p>Based on data from our 2024 partner campaigns</p>
            </div>
            <div className="mt-3 opacity-0 transition-all group-hover:opacity-100">
              <Button variant="link" size="sm" className="text-strawberry-600">
                Calculate your ROI
              </Button>
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-lg bg-gradient-to-br from-strawberry-50 to-strawberry-100 p-6 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-strawberry-500 opacity-10 transition-transform group-hover:scale-110"></div>
          <div className="relative z-10">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-strawberry-100 text-strawberry-600 transition-all group-hover:bg-strawberry-200">
              <Award className="h-7 w-7" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-strawberry-700">Campaign Success</h3>
            <div className="flex justify-center gap-6">
              <div>
                <p className="text-3xl font-bold text-strawberry-600 transition-all group-hover:scale-110">1,482</p>
                <p className="text-gray-700">active participants</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-strawberry-600 transition-all group-hover:scale-110">12</p>
                <p className="text-gray-700">city locations</p>
              </div>
            </div>
            <div className="mt-3 text-sm text-gray-600 opacity-0 transition-all group-hover:opacity-100">
              <p>Summer Adventure Quest sponsored by Sweet Treats Inc.</p>
            </div>
            <div className="mt-3 opacity-0 transition-all group-hover:opacity-100">
              <Button variant="link" size="sm" className="text-strawberry-600">
                View case study
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Key Benefits */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">Key Benefits</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Discover how your brand can benefit from our unique platform that combines gamification with passionate ice
            cream enthusiasts.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="h-2 bg-strawberry-500"></div>
            <CardHeader>
              <Target className="mb-4 h-10 w-10 text-strawberry-600" />
              <CardTitle>Targeted Exposure</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Reach a highly engaged community of ice cream enthusiasts actively seeking new flavors and experiences
                across numerous shops.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Connect with passionate ice cream enthusiasts specifically interested in new flavors
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Target users in specific regions, neighborhoods, or near your physical locations
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="h-2 bg-strawberry-500"></div>
            <CardHeader>
              <Award className="mb-4 h-10 w-10 text-strawberry-600" />
              <CardTitle>Gamified Engagement</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Transform traditional advertising into interactive experiences that motivate real-world actions and
                build lasting brand loyalty.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Create fun challenges that drive visits to specific locations or flavor trials
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Reward users with branded digital badges that they proudly display and share
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <div className="h-2 bg-strawberry-500"></div>
            <CardHeader>
              <BarChart className="mb-4 h-10 w-10 text-strawberry-600" />
              <CardTitle>Data-Driven Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Access comprehensive analytics to measure campaign performance, understand consumer behaviors, and
                optimize your marketing strategy.
              </p>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Track engagement metrics, conversions, and ROI with our comprehensive dashboard
                  </span>
                </li>
                <li className="flex items-start">
                  <CheckCircle2 className="mr-2 mt-1 h-4 w-4 text-strawberry-500" />
                  <span className="text-sm">
                    Gain valuable data on flavor preferences, trending tastes, and purchase patterns
                  </span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sponsorship Opportunities */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">Sponsorship Opportunities</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Choose your partnership path with flexible sponsorship options designed to meet your marketing goals and
            budget
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <OpportunityCard
            icon={<Award className="h-10 w-10 text-strawberry-600" />}
            title="Quest Sponsorship"
            description="Create branded challenges for users to complete, driving engagement and store visits."
            benefits={["Increased foot traffic", "Brand visibility", "Customer loyalty"]}
            ctaLink="/business/contact?type=quest"
          />

          <OpportunityCard
            icon={<Star className="h-10 w-10 text-strawberry-600" />}
            title="Badge Rewards"
            description="Design exclusive digital collectibles as rewards for completing specific activities."
            benefits={["Digital collectibles", "Social sharing", "Repeat purchases"]}
            ctaLink="/business/contact?type=badge"
          />

          <OpportunityCard
            icon={<Calendar className="h-10 w-10 text-strawberry-600" />}
            title="Featured Events"
            description="Promote special tastings, flavor launches, or ice cream events to our community."
            benefits={["Event promotion", "Community building", "Targeted marketing"]}
            ctaLink="/business/contact?type=events"
          />

          <OpportunityCard
            icon={<BarChart className="h-10 w-10 text-strawberry-600" />}
            title="Data Insights"
            description="Gain valuable market intelligence on flavor preferences and consumer behavior."
            benefits={["Customer insights", "Trend analysis", "Product development"]}
            ctaLink="/business/contact?type=insights"
          />
        </div>
      </div>

      {/* Success Stories */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">Partner Success Stories</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Hear from businesses who've successfully partnered with ConeDex to boost their brand
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-strawberry-100">
                  <Store className="h-8 w-8 text-strawberry-600" />
                </div>
                <div>
                  <p className="font-semibold">Artisanal Ice Cream Shop</p>
                  <p className="text-sm text-gray-600">Local Business</p>
                </div>
              </div>
              <p className="mb-6 text-gray-700">
                "Our summer flavor quest sponsorship drove a 42% increase in store visits and helped us launch our new
                product line with built-in customer enthusiasm."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <img
                    src="/confident-marketing-leader.png"
                    alt="Marketing Director"
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold">Jennifer Reyes</p>
                  <p className="text-sm text-gray-600">Marketing Director</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-strawberry-100">
                  <Zap className="h-8 w-8 text-strawberry-600" />
                </div>
                <div>
                  <p className="font-semibold">Premium Flavor Manufacturer</p>
                  <p className="text-sm text-gray-600">Industry Supplier</p>
                </div>
              </div>
              <p className="mb-6 text-gray-700">
                "The data insights we gained from our ConeDex partnership directly influenced our product development.
                Our newest flavor was inspired by trends we identified through the platform."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <img src="/focused-asian-pm.png" alt="Product Manager" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Michael Chen</p>
                  <p className="text-sm text-gray-600">Product Manager</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md transition-all duration-200 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-strawberry-100">
                  <Globe className="h-8 w-8 text-strawberry-600" />
                </div>
                <div>
                  <p className="font-semibold">Boutique Dessert Brand</p>
                  <p className="text-sm text-gray-600">Emerging Business</p>
                </div>
              </div>
              <p className="mb-6 text-gray-700">
                "As a small artisanal brand, our badge sponsorship gave us exposure we couldn't have achieved through
                traditional advertising. The ROI has been incredible for our marketing budget."
              </p>
              <div className="flex items-center">
                <div className="mr-4 h-12 w-12 overflow-hidden rounded-full">
                  <img src="/confident-indian-leader.png" alt="Business Owner" className="h-full w-full object-cover" />
                </div>
                <div>
                  <p className="font-semibold">Aisha Patel</p>
                  <p className="text-sm text-gray-600">Founder & Owner</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="mb-16">
        <div className="mb-10 text-center">
          <h2 className="mb-4 text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Get answers to common questions about our business sponsorship program
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
                <h3 className="mb-2 text-lg font-medium">What types of businesses can partner with ConeDex?</h3>
                <p>
                  We welcome partnerships with ice cream shops, dairy producers, flavor manufacturers, equipment
                  suppliers, and any food or beverage brands that align with our community's interests. We also partner
                  with local businesses looking to increase foot traffic and visibility.
                </p>
              </TabsContent>
              <TabsContent value="pricing">
                <h3 className="mb-2 text-lg font-medium">How much does sponsorship cost?</h3>
                <p>
                  Our sponsorship packages start at $500 for local campaigns and range up to $10,000+ for national
                  promotions. We offer flexible options to accommodate various budgets and can create custom packages
                  tailored to your specific goals and target audience.
                </p>
              </TabsContent>
              <TabsContent value="roi">
                <h3 className="mb-2 text-lg font-medium">How do I measure ROI from ConeDex partnerships?</h3>
                <p>
                  All sponsors receive access to our analytics dashboard that tracks engagement metrics, including quest
                  completions, badge collections, store visits, and user interactions. We also provide detailed reports
                  on user demographics and behavior patterns to help you measure campaign effectiveness.
                </p>
              </TabsContent>
              <TabsContent value="timeline">
                <h3 className="mb-2 text-lg font-medium">How long does a typical partnership last?</h3>
                <p>
                  We offer seasonal campaigns (3 months), half-year partnerships, and annual sponsorships. Many partners
                  start with a seasonal campaign to test effectiveness before committing to longer-term relationships.
                  Our most successful partners typically renew for multiple years.
                </p>
              </TabsContent>
              <TabsContent value="difference">
                <h3 className="mb-2 text-lg font-medium">What makes ConeDex different from traditional advertising?</h3>
                <p>
                  ConeDex offers gamified engagement that motivates real-world actions. Unlike passive advertising, our
                  platform encourages users to actively seek out sponsored experiences, creating meaningful brand
                  interactions. Our users are highly engaged ice cream enthusiasts who are specifically interested in
                  discovering new flavors and experiences.
                </p>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Contact Form */}
      <div className="rounded-lg bg-gradient-to-br from-strawberry-50 to-white p-8 shadow-md">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
          <p className="mx-auto max-w-2xl text-lg text-gray-600">
            Fill out the form to inquire about partnership opportunities. Our sponsorship team will contact you within
            1-2 business days to discuss how we can work together.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1">
            <div className="space-y-6">
              <div className="flex items-start">
                <Users className="mr-4 mt-1 h-6 w-6 text-strawberry-600" />
                <div>
                  <h3 className="font-medium">Dedicated Support</h3>
                  <p className="text-sm text-gray-600">You'll work with a dedicated partnership manager</p>
                </div>
              </div>
              <div className="flex items-start">
                <Star className="mr-4 mt-1 h-6 w-6 text-strawberry-600" />
                <div>
                  <h3 className="font-medium">Brand Control</h3>
                  <p className="text-sm text-gray-600">Full approval rights on all branded content</p>
                </div>
              </div>
              <div className="flex items-start">
                <Award className="mr-4 mt-1 h-6 w-6 text-strawberry-600" />
                <div>
                  <h3 className="font-medium">Trusted Platform</h3>
                  <p className="text-sm text-gray-600">Join over 50 successful brand partnerships</p>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Business Sponsorship Inquiry</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="company">Company Name *</Label>
                      <Input id="company" placeholder="Your company name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="name">Contact Person *</Label>
                      <Input id="name" placeholder="Your full name" required />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address *</Label>
                      <Input id="email" type="email" placeholder="your.email@company.com" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input id="phone" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Position/Title</Label>
                      <Input id="title" placeholder="Marketing Director" />
                    </div>
                    <div className="space-y-2">
                      <Label>Partnership Interests</Label>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox id="quest" />
                          <label htmlFor="quest" className="text-sm">
                            Quest Sponsorship
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="badge" />
                          <label htmlFor="badge" className="text-sm">
                            Badge Rewards
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox id="events" />
                          <label htmlFor="events" className="text-sm">
                            Featured Events
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="budget">Budget Range</Label>
                      <Input id="budget" placeholder="e.g. $500-$2000" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
                      <Input id="timeline" placeholder="e.g. Q2 2025, Summer 2025" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Message *</Label>
                    <Textarea
                      id="message"
                      placeholder="Please provide details about your partnership goals, target audience, and any specific ideas you have for collaboration..."
                      rows={4}
                      required
                    />
                  </div>

                  <p className="text-xs text-gray-500">Fields marked with * are required.</p>

                  <Button type="submit" className="w-full">
                    Submit Inquiry
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function OpportunityCard({ icon, title, description, benefits, ctaLink }) {
  return (
    <Card className="flex h-full flex-col overflow-hidden border-0 shadow-md transition-all duration-200 hover:shadow-lg">
      <div className="h-1 bg-strawberry-500"></div>
      <CardHeader>
        <div className="mb-4">{icon}</div>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <p className="mb-4 flex-1 text-gray-600">{description}</p>
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-center">
              <CheckCircle2 className="mr-2 h-4 w-4 text-strawberry-500" />
              <span className="text-sm">{benefit}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}
