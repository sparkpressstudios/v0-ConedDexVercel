import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export function PricingSection() {
  const plans = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for ice cream enthusiasts",
      features: [
        "Track up to 50 flavors",
        "Basic shop discovery",
        "Personal flavor collection",
        "Community leaderboards",
      ],
      cta: "Get Started",
      href: "/signup",
      popular: false,
    },
    {
      name: "Premium",
      price: "$4.99",
      period: "per month",
      description: "For serious ice cream connoisseurs",
      features: [
        "Unlimited flavor tracking",
        "Advanced flavor analytics",
        "Exclusive badges",
        "Team creation",
        "Offline access",
        "Priority support",
      ],
      cta: "Upgrade Now",
      href: "/pricing",
      popular: true,
    },
    {
      name: "Business",
      price: "$19.99",
      period: "per month",
      description: "For ice cream shops and businesses",
      features: [
        "Verified shop profile",
        "Customer analytics",
        "Flavor popularity insights",
        "Special promotion tools",
        "Customer engagement features",
        "API access",
      ],
      cta: "Contact Sales",
      href: "/business",
      popular: false,
    },
  ]

  return (
    <section className="bg-white py-16 dark:bg-gray-950">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Simple, Transparent Pricing</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            Choose the plan that's right for you, whether you're an ice cream enthusiast or a business owner.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`rounded-lg border ${
                plan.popular ? "border-primary shadow-lg dark:border-primary" : "border-gray-200 dark:border-gray-800"
              } bg-white p-6 dark:bg-gray-900`}
            >
              {plan.popular && (
                <div className="mb-4 rounded-full bg-primary/10 px-3 py-1 text-center text-sm font-medium text-primary">
                  Most Popular
                </div>
              )}
              <h3 className="mb-2 text-2xl font-bold">{plan.name}</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-gray-500 dark:text-gray-400">{plan.period}</span>}
              </div>
              <p className="mb-6 text-gray-600 dark:text-gray-400">{plan.description}</p>
              <ul className="mb-6 space-y-2">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center">
                    <Check className="mr-2 h-5 w-5 text-green-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
