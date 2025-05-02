import { Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-4 text-4xl font-bold tracking-tight text-gray-900 md:text-5xl">Contact Us</h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-600">
          Have questions about ConeDex? We're here to help! Reach out to our team using any of the methods below.
        </p>
      </div>

      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2">
        {/* Contact Information */}
        <div className="space-y-8 rounded-lg bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900">Get in Touch</h2>

          <div className="flex items-start space-x-4">
            <Mail className="h-6 w-6 text-blueberry-600" />
            <div>
              <p className="font-medium text-gray-900">Email Us</p>
              <p className="text-gray-600">hello@conedex.com</p>
              <p className="mt-1 text-sm text-gray-500">We'll respond within 24 hours</p>
            </div>
          </div>

          <div className="mt-8 space-y-4 rounded-lg bg-blueberry-50 p-6">
            <h3 className="font-medium text-gray-900">For Business Inquiries</h3>
            <p className="text-gray-600">
              Interested in partnering with ConeDex? Contact our business development team at
              <a href="mailto:partners@conedex.com" className="ml-1 font-medium text-blueberry-600 hover:underline">
                partners@conedex.com
              </a>
            </p>
          </div>
        </div>

        {/* Contact Form */}
        <div className="rounded-lg bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">Send Us a Message</h2>

          <form className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <Input id="name" placeholder="Your name" required />
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <Input id="email" type="email" placeholder="your@email.com" required />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium text-gray-700">
                Subject
              </label>
              <Input id="subject" placeholder="How can we help you?" required />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium text-gray-700">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Tell us more about your inquiry..."
                className="min-h-[150px]"
                required
              />
            </div>

            <Button type="submit" className="w-full">
              Send Message
            </Button>

            <p className="text-center text-sm text-gray-500">We'll get back to you as soon as possible!</p>
          </form>
        </div>
      </div>
    </div>
  )
}
