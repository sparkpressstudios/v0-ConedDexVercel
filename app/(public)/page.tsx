import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function HomePage() {
  return (
    <div className="flex flex-col gap-8 py-8">
      <section className="flex flex-col-reverse md:flex-row items-center gap-6 md:gap-12">
        <div className="flex-1 space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            Discover & Track
            <span className="block text-primary">Ice Cream</span>
            Adventures
          </h1>
          <p className="text-xl text-muted-foreground">
            ConeDex helps you find new flavors, track your favorites, and connect with a community of ice cream
            enthusiasts.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button asChild size="lg">
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/features">Learn More</Link>
            </Button>
          </div>
        </div>
        <div className="flex-1">
          <Image
            src="/ice-cream-dashboard.png"
            alt="ConeDex Dashboard Preview"
            width={600}
            height={400}
            className="rounded-lg shadow-lg"
            priority
          />
        </div>
      </section>

      {/* Rest of the homepage content */}
    </div>
  )
}
