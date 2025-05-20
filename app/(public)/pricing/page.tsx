import Link from "next/link"
import { Check, X, HelpCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-200">Pricing</Badge>
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Choose the plan that's right for your ice cream business, from small shops to large chains.
        </p>
      </div>

      <div className="mb-12">
        <Tabs defaultValue="monthly" className="w-full">
          <div className="flex justify-center">
            <TabsList className="mb-8">
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
              <TabsTrigger value="annual">
                Annual Billing <Badge className="ml-2 bg-green-100 text-green-800">Save 20%</Badge>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="monthly">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <PricingCard
                title="Basic"
                price="$0"
                period="/month"
                description="For small shops just getting started"
                features={[
                  { name: "Basic shop profile", included: true },
                  { name: "Up to 10 flavors", included: true },
                  { name: "Customer reviews", included: true },
                  { name: "Basic analytics", included: true },
                  { name: "Respond to reviews", included: true },
                  { name: "Standard support", included: true },
                  { name: "Featured in search results", included: false },
                  { name: "Promotional announcements", included: false },
                  { name: "Advanced analytics", included: false },
                  { name: "Multiple location management", included: false },
                ]}
                buttonText="Get Started"
                buttonLink="/business/claim"
                buttonVariant="outline"
                popular={false}
              />

              {/* Pro Plan */}
              <PricingCard
                title="Premium"
                price="$19"
                period="/month"
                description="For established ice cream shops"
                features={[
                  { name: "Enhanced shop profile", included: true },
                  { name: "Unlimited flavors", included: true },
                  { name: "Customer reviews", included: true },
                  { name: "Advanced analytics", included: true },
                  { name: "Respond to reviews", included: true },
                  { name: "Priority support", included: true },
                  { name: "Featured in search results", included: true },
                  { name: "Promotional announcements", included: true },
                  { name: "Marketing tools", included: true },
                  { name: "Single location management", included: true },
                ]}
                buttonText="Start Free Trial"
                buttonLink="/business/claim"
                buttonVariant="default"
                popular={true}
              />

              {/* Enterprise Plan */}
              <PricingCard
                title="Enterprise"
                price="$99"
                period="/month"
                description="For chains with multiple locations"
                features={[
                  { name: "All Premium features", included: true },
                  { name: "Multi-location management", included: true },
                  { name: "Brand consistency tools", included: true },
                  { name: "API access", included: true },
                  { name: "Custom integrations", included: true },
                  { name: "Dedicated account manager", included: true },
                  { name: "Custom analytics", included: true },
                  { name: "White-label options", included: true },
                  { name: "Priority feature requests", included: true },
                  { name: "Enterprise SLA", included: true },
                ]}
                buttonText="Contact Sales"
                buttonLink="/contact"
                buttonVariant="outline"
                popular={false}
              />
            </div>
          </TabsContent>

          <TabsContent value="annual">
            <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
              {/* Free Plan */}
              <PricingCard
                title="Basic"
                price="$0"
                period="/month"
                description="For small shops just getting started"
                features={[
                  { name: "Basic shop profile", included: true },
                  { name: "Up to 10 flavors", included: true },
                  { name: "Customer reviews", included: true },
                  { name: "Basic analytics", included: true },
                  { name: "Respond to reviews", included: true },
                  { name: "Standard support", included: true },
                  { name: "Featured in search results", included: false },
                  { name: "Promotional announcements", included: false },
                  { name: "Advanced analytics", included: false },
                  { name: "Multiple location management", included: false },
                ]}
                buttonText="Get Started"
                buttonLink="/business/claim"
                buttonVariant="outline"
                popular={false}
              />

              {/* Pro Plan */}
              <PricingCard
                title="Premium"
                price="$15"
                period="/month"
                description="For established ice cream shops"
                features={[
                  { name: "Enhanced shop profile", included: true },
                  { name: "Unlimited flavors", included: true },
                  { name: "Customer reviews", included: true },
                  { name: "Advanced analytics", included: true },
                  { name: "Respond to reviews", included: true },
                  { name: "Priority support", included: true },
                  { name: "Featured in search results", included: true },
                  { name: "Promotional announcements", included: true },
                  { name: "Marketing tools", included: true },
                  { name: "Single location management", included: true },
                ]}
                buttonText="Start Free Trial"
                buttonLink="/business/claim"
                buttonVariant="default"
                popular={true}
                badge="Save 20%"
              />

              {/* Enterprise Plan */}
              <PricingCard
                title="Enterprise"
                price="$79"
                period="/month"
                description="For chains with multiple locations"
                features={[
                  { name: "All Premium features", included: true },
                  { name: "Multi-location management", included: true },
                  { name: "Brand consistency tools", included: true },
                  { name: "API access", included: true },
                  { name: "Custom integrations", included: true },
                  { name: "Dedicated account manager", included: true },
                  { name: "Custom analytics", included: true },
                  { name: "White-label options", included: true },
                  { name: "Priority feature requests", included: true },
                  { name: "Enterprise SLA", included: true },
                ]}
                buttonText="Contact Sales"
                buttonLink="/contact"
                buttonVariant="outline"
                popular={false}
                badge="Save 20%"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Feature Comparison */}
      <div className="mb-16">
        <h2 className="mb-8 text-center text-3xl font-bold">Feature Comparison</h2>
        <div className="mx-auto max-w-6xl overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-4 text-left">Feature</th>
                <th className="py-4 text-center">Basic</th>
                <th className="py-4 text-center">Premium</th>
                <th className="py-4 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody>
              <FeatureRow
                feature="Shop Profile"
                basic="Basic profile"
                premium="Enhanced profile"
                enterprise="Custom branded profile"
                tooltip="Your shop's page on ConeDex with photos, description, and contact information"
              />
              <FeatureRow
                feature="Flavor Management"
                basic="Up to 10 flavors"
                premium="Unlimited flavors"
                enterprise="Unlimited flavors"
                tooltip="Add, edit, and manage your ice cream flavors"
              />
              <FeatureRow
                feature="Customer Reviews"
                basic="View and respond"
                premium="View, respond, and highlight"
                enterprise="Full moderation tools"
                tooltip="Manage customer reviews of your shop and flavors"
              />
              <FeatureRow
                feature="Analytics"
                basic="Basic metrics"
                premium="Advanced insights"
                enterprise="Custom reports"
                tooltip="Data on shop visits, popular flavors, and customer engagement"
              />
              <FeatureRow
                feature="Search Visibility"
                basic="Standard listing"
                premium="Featured results"
                enterprise="Priority placement"
                tooltip="How prominently your shop appears in search results"
              />
              <FeatureRow
                feature="Marketing Tools"
                basic="—"
                premium="Standard tools"
                enterprise="Advanced campaigns"
                tooltip="Tools to promote your shop and special offers"
              />
              <FeatureRow
                feature="Location Management"
                basic="Single location"
                premium="Single location"
                enterprise="Multiple locations"
                tooltip="Manage multiple shop locations from one account"
              />
              <FeatureRow
                feature="API Access"
                basic="—"
                premium="—"
                enterprise="Full API access"
                tooltip="Programmatic access to your shop data"
              />
              <FeatureRow
                feature="Support"
                basic="Email support"
                premium="Priority email"
                enterprise="Dedicated manager"
                tooltip="Customer support options"
              />
              <FeatureRow
                feature="Custom Integrations"
                basic="—"
                premium="—"
                enterprise="Available"
                tooltip="Connect ConeDex with your existing systems"
              />
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          <FAQItem
            question="How does the free trial work?"
            answer="Our 14-day free trial gives you full access to all Premium plan features. No credit card required to start. At the end of your trial, you can choose to subscribe or downgrade to the Basic plan."
          />
          <FAQItem
            question="Can I change plans later?"
            answer="Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes to your subscription will take effect at the start of your next billing cycle."
          />
          <FAQItem
            question="What payment methods do you accept?"
            answer="We accept all major credit cards, including Visa, Mastercard, American Express, and Discover. For Enterprise plans, we also offer invoicing options."
          />
          <FAQItem
            question="Is there a discount for annual billing?"
            answer="Yes, you can save 20% by choosing annual billing on any of our paid plans. This option is available during signup or from your account settings."
          />
          <FAQItem
            question="Do I need to provide a credit card for the Basic plan?"
            answer="No, the Basic plan is completely free and doesn't require any payment information. You can use it for as long as you like without any charges."
          />
          <FAQItem
            question="What happens if I need more features later?"
            answer="You can upgrade to a higher tier plan at any time. Your new features will be available immediately, and you'll be billed pro-rata for the remainder of your billing cycle."
          />
        </div>
      </div>

      <div className="mt-16 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Ready to grow your ice cream business?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-gray-600">
          Join thousands of ice cream shops already using ConeDex to connect with customers and increase sales.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
            <Link href="/business/claim">Get Started Today</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

function PricingCard({
  title,
  price,
  period,
  description,
  features,
  buttonText,
  buttonLink,
  buttonVariant = "default",
  popular = false,
  badge = null,
}) {
  return (
    <Card
      className={`flex flex-col border-2 ${popular ? "border-blue-500 shadow-lg shadow-blue-100" : "border-gray-200"} relative`}
    >
      {popular && (
        <div className="absolute -top-4 left-0 right-0 mx-auto w-fit rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
          MOST POPULAR
        </div>
      )}
      {badge && (
        <div className="absolute -top-4 right-4 rounded-full bg-green-600 px-3 py-1 text-xs font-semibold text-white">
          {badge}
        </div>
      )}
      <CardHeader className={popular ? "bg-blue-50" : ""}>
        <CardTitle className="text-2xl">{title}</CardTitle>
        <div className="mt-4">
          <span className="text-4xl font-bold">{price}</span>
          <span className="text-gray-500">{period}</span>
        </div>
        <CardDescription className="mt-2">{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-center">
              {feature.included ? (
                <Check className="mr-2 h-5 w-5 text-green-500" />
              ) : (
                <X className="mr-2 h-5 w-5 text-gray-300" />
              )}
              <span className={feature.included ? "" : "text-gray-400"}>{feature.name}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant={buttonVariant}
          className={`w-full ${buttonVariant === "default" && popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}
        >
          <Link href={buttonLink}>{buttonText}</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

function FeatureRow({ feature, basic, premium, enterprise, tooltip }) {
  return (
    <tr className="border-b">
      <td className="py-4">
        <div className="flex items-center">
          {feature}
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <HelpCircle className="ml-2 h-4 w-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </td>
      <td className="py-4 text-center">{basic === "—" ? <span className="text-gray-400">—</span> : basic}</td>
      <td className="py-4 text-center">{premium === "—" ? <span className="text-gray-400">—</span> : premium}</td>
      <td className="py-4 text-center">{enterprise === "—" ? <span className="text-gray-400">—</span> : enterprise}</td>
    </tr>
  )
}

function FAQItem({ question, answer }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 text-left shadow-sm">
      <h3 className="mb-3 text-lg font-semibold">{question}</h3>
      <p className="text-gray-600">{answer}</p>
    </div>
  )
}
