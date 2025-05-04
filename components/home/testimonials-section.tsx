import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"

export function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Ice Cream Enthusiast",
      content:
        "ConeDex has completely changed how I discover new ice cream flavors. The badge system makes trying new things fun, and I've found so many hidden gem shops in my city!",
      avatar: "/confident-marketing-leader.png",
      rating: 5,
    },
    {
      name: "Michael Chen",
      role: "Shop Owner",
      content:
        "As a shop owner, ConeDex has helped me connect with customers and get valuable feedback. The analytics tools give me insights I never had before.",
      avatar: "/focused-asian-pm.png",
      rating: 5,
    },
    {
      name: "Priya Patel",
      role: "Food Blogger",
      content:
        "I use ConeDex to keep track of all the flavors I try for my blog. The detailed flavor profiles and ability to add notes makes my reviews so much easier to write.",
      avatar: "/confident-indian-leader.png",
      rating: 4,
    },
  ]

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">What Our Users Say</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            Don't just take our word for it. Here's what ice cream lovers and shop owners have to say about ConeDex.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="mb-4 flex">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ))}
                  {[...Array(5 - testimonial.rating)].map((_, i) => (
                    <Star key={i + testimonial.rating} className="h-5 w-5 text-gray-300" />
                  ))}
                </div>
                <p className="mb-4 text-gray-600 dark:text-gray-400">{testimonial.content}</p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="mr-4 h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
