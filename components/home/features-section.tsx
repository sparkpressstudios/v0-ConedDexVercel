import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { IceCream, Map, Award, Users, Heart, Star } from "lucide-react"

export function FeaturesSection() {
  const features = [
    {
      icon: <IceCream className="h-10 w-10 text-pink-500" />,
      title: "Flavor Tracking",
      description: "Log and rate every ice cream flavor you try, building your personal ConeDex collection.",
    },
    {
      icon: <Map className="h-10 w-10 text-blue-500" />,
      title: "Shop Discovery",
      description: "Find the best ice cream shops near you with our interactive map and community reviews.",
    },
    {
      icon: <Award className="h-10 w-10 text-yellow-500" />,
      title: "Badges & Achievements",
      description: "Earn badges as you explore new flavors, visit shops, and engage with the community.",
    },
    {
      icon: <Users className="h-10 w-10 text-green-500" />,
      title: "Ice Cream Teams",
      description: "Create or join teams to compete in flavor challenges and seasonal leaderboards.",
    },
    {
      icon: <Heart className="h-10 w-10 text-red-500" />,
      title: "Personalized Recommendations",
      description: "Get flavor suggestions based on your taste preferences and rating history.",
    },
    {
      icon: <Star className="h-10 w-10 text-purple-500" />,
      title: "Shop Owner Tools",
      description: "Special features for shop owners to manage their profile and engage with customers.",
    },
  ]

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">Explore ConeDex Features</h2>
          <p className="mx-auto max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Everything you need to enhance your ice cream experience and connect with a community of fellow enthusiasts.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="mb-4">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
