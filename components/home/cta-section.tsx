import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTASection() {
  return (
    <section className="bg-primary py-16 text-primary-foreground w-full">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Ready to Start Your Ice Cream Journey?</h2>
          <p className="mb-8 text-lg">
            Join thousands of ice cream enthusiasts and shop owners on ConeDex today. Start tracking flavors,
            discovering new shops, and connecting with the community.
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-x-4 sm:space-y-0">
            <Link href="/signup">
              <Button size="lg" variant="secondary">
                Sign Up Now
              </Button>
            </Link>
            <Link href="/business">
              <Button size="lg" variant="outline">
                For Business Owners
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
