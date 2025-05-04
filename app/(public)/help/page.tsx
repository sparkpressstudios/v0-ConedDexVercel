import type { Metadata } from "next"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, MessageCircle, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help Center | ConeDex",
  description:
    "Get help with using ConeDex - Find answers to frequently asked questions and learn how to use our platform.",
}

export default function HelpCenterPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-8">Help Center</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-semibold mb-6">Frequently Asked Questions</h2>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How do I create an account?</AccordionTrigger>
              <AccordionContent>
                To create an account, click on the "Sign Up" button in the top right corner of the page. Fill in your
                details, including your name, email address, and password. Once you've completed the form, click "Sign
                Up" to create your account.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-2">
              <AccordionTrigger>How do I log a new ice cream flavor?</AccordionTrigger>
              <AccordionContent>
                To log a new ice cream flavor, navigate to the "Log Flavor" page from your dashboard. Fill in the
                details about the flavor, including the name, description, and where you tried it. You can also add a
                rating and upload a photo of the ice cream.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-3">
              <AccordionTrigger>How do I find ice cream shops near me?</AccordionTrigger>
              <AccordionContent>
                To find ice cream shops near you, go to the "Shops" page and allow the website to access your location.
                The map will show you ice cream shops in your area. You can also search for shops by name or location.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-4">
              <AccordionTrigger>How do I claim my ice cream shop?</AccordionTrigger>
              <AccordionContent>
                If you own an ice cream shop, you can claim it by going to the "Business" section and clicking on "Claim
                Your Shop". Search for your shop, and if it exists, you can claim it. If it doesn't exist, you can add
                it to our database. You'll need to verify ownership through our verification process.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-5">
              <AccordionTrigger>What are badges and how do I earn them?</AccordionTrigger>
              <AccordionContent>
                Badges are achievements you can earn on ConeDex. You can earn badges by trying different flavors,
                visiting different shops, writing reviews, and more. Check your profile to see which badges you've
                earned and which ones you're close to earning.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-6">
              <AccordionTrigger>How do I follow my favorite ice cream shops?</AccordionTrigger>
              <AccordionContent>
                To follow an ice cream shop, visit the shop's page and click the "Follow" button. You'll receive
                notifications when the shop adds new flavors or posts announcements. You can manage the shops you follow
                in your dashboard.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-7">
              <AccordionTrigger>Can I use ConeDex on my mobile device?</AccordionTrigger>
              <AccordionContent>
                Yes! ConeDex is fully responsive and works on mobile devices. You can also install it as a Progressive
                Web App (PWA) on your home screen for a more app-like experience. Visit our "Offline Features" page to
                learn more.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="item-8">
              <AccordionTrigger>How do I join or create a team?</AccordionTrigger>
              <AccordionContent>
                You can join or create a team by going to the "Teams" section in your dashboard. To create a team, click
                "Create Team" and fill in the details. To join a team, you'll need an invitation from a team member or
                admin. Teams allow you to track ice cream adventures together!
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div className="md:col-span-1">
          <h2 className="text-2xl font-semibold mb-6">Contact Support</h2>

          <div className="space-y-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <Mail className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Email Support</h3>
                    <p className="text-sm text-muted-foreground mb-2">Get help via email</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/contact">Contact Us</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <MessageCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Live Chat</h3>
                    <p className="text-sm text-muted-foreground mb-2">Chat with our support team</p>
                    <Button variant="outline" size="sm">
                      Start Chat
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <FileText className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Documentation</h3>
                    <p className="text-sm text-muted-foreground mb-2">Read our detailed guides</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/docs">View Docs</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-4">
                  <HelpCircle className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <h3 className="font-medium">Community Forum</h3>
                    <p className="text-sm text-muted-foreground mb-2">Get help from the community</p>
                    <Button asChild variant="outline" size="sm">
                      <Link href="/forum">Visit Forum</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
