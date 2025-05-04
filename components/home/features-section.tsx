import { Search, MapPin, Star, Award, Users, TrendingUp } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <Search className="h-10 w-10 text-primary" />,
      title: "Discover New Flavors",
      description: "Explore thousands of ice cream flavors from shops around the world.",
    },
    {
      icon: <MapPin className="h-10 w-10 text-primary" />,
      title: "Find Nearby Shops",
      description: "Locate the best ice cream shops near you with our interactive map.",
    },
    {
      icon: <Star className="h-10 w-10 text-primary" />,
      title: "Rate & Review",
      description: "Share your opinions and read reviews from other ice cream enthusiasts.",
    },
    {
      icon: <Award className="h-10 w-10 text-primary" />,
      title: "Earn Badges",
      description: "Collect badges as you try new flavors and visit different shops.",
    },
    {
      icon: <Users className="h-10 w-10 text-primary" />,
      title: "Join Communities",
      description: "Connect with fellow ice cream lovers and share your experiences.",
    },
    {
      icon: <TrendingUp className="h-10 w-10 text-primary" />,
      title: "Track Trends",
      description: "Stay updated with the latest trends in the ice cream world.",
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Features</h2>
            <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
              Everything you need to enhance your ice cream experience
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              {feature.icon}
              <h3 className="text-xl font-bold">{feature.title}</h3>
              <p className="text-center text-gray-500 dark:text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
