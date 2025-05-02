import Link from "next/link"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">
          Simple, Transparent Pricing
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Choose the plan that's right for your ice cream business, from small shops to large chains.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
        {/* Free Plan */}
        <Card className="flex flex-col border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl">Basic</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/month</span>
            </div>
            <CardDescription className="mt-2">For small shops just getting started</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <PricingFeature>Basic shop profile</PricingFeature>
              <PricingFeature>Up to 20 flavors</PricingFeature>
              <PricingFeature>Customer reviews</PricingFeature>
              <PricingFeature>Basic analytics</PricingFeature>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/business/claim">Get Started</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Pro Plan */}
        <Card className="flex flex-col border-2 border-blueberry-500 shadow-lg shadow-blueberry-100">
          <CardHeader className="bg-blueberry-50">
            <div className="mb-2 text-center">
              <span className="rounded-full bg-blueberry-100 px-3 py-1 text-xs font-semibold text-blueberry-800">
                MOST POPULAR
              </span>
            </div>
            <CardTitle className="text-2xl">Professional</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-gray-500">/month</span>
            </div>
            <CardDescription className="mt-2">For established ice cream shops</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <PricingFeature>Enhanced shop profile</PricingFeature>
              <PricingFeature>Unlimited flavors</PricingFeature>
              <PricingFeature>Customer engagement tools</PricingFeature>
              <PricingFeature>Advanced analytics</PricingFeature>
              <PricingFeature>Marketing tools</PricingFeature>
              <PricingFeature>Priority support</PricingFeature>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full bg-blueberry-600 hover:bg-blueberry-700">
              <Link href="/business/claim">Start Free Trial</Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Enterprise Plan */}
        <Card className="flex flex-col border-2 border-gray-200">
          <CardHeader>
            <CardTitle className="text-2xl">Enterprise</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$99</span>
              <span className="text-gray-500">/month</span>
            </div>
            <CardDescription className="mt-2">For chains with multiple locations</CardDescription>
          </CardHeader>
          <CardContent className="flex-1">
            <ul className="space-y-3">
              <PricingFeature>All Professional features</PricingFeature>
              <PricingFeature>Multi-location management</PricingFeature>
              <PricingFeature>Brand consistency tools</PricingFeature>
              <PricingFeature>API access</PricingFeature>
              <PricingFeature>Custom integrations</PricingFeature>
              <PricingFeature>Dedicated account manager</PricingFeature>
            </ul>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="mt-16 text-center">
        <h2 className="mb-4 text-3xl font-bold text-gray-900">Frequently Asked Questions</h2>
        <div className="mx-auto mt-8 max-w-3xl space-y-6">
          <FAQItem
            question="How does the free trial work?"
            answer="Our 14-day free trial gives you full access to all Professional plan features. No credit card required to start. At the end of your trial, you can choose to subscribe or downgrade to the Basic plan."
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
        </div>
      </div>

      <div className="mt-16 rounded-xl bg-blueberry-50 p-8 text-center">
        <h2 className="mb-4 text-2xl font-bold text-gray-900">Ready to grow your ice cream business?</h2>
        <p className="mx-auto mb-6 max-w-2xl text-gray-600">
          Join thousands of ice cream shops already using ConeDex to connect with customers and increase sales.
        </p>
        <Button asChild size="lg" className="bg-blueberry-600 hover:bg-blueberry-700">
          <Link href="/business/claim">Get Started Today</Link>
        </Button>
      </div>
    </div>
  )
}

function PricingFeature({ children }) {
  return (
    <li className="flex items-center">
      <Check className="mr-2 h-5 w-5 text-blueberry-500" />
      <span>{children}</span>
    </li>
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
