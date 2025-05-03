"use client"

import { HeroSection } from "@/components/home/hero-section"
import { FeaturesSection } from "@/components/home/features-section"
import { TestimonialsSection } from "@/components/home/testimonials-section"
import { PricingSection } from "@/components/home/pricing-section"
import { CtaSection } from "@/components/home/cta-section"
import { PartnersSection } from "@/components/home/partners-section"
import { StatsSection } from "@/components/home/stats-section"
import { useEffect, useState } from "react"

export function HomePageContent() {
  // Use state to ensure client-side rendering
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a simple loading state until client-side rendering kicks in
    return (
      <main className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-center">
          <h1 className="text-2xl font-bold">Loading ConeDex...</h1>
          <p className="text-gray-500 mt-2">The ultimate ice cream explorer</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex-1">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <PartnersSection />
      <CtaSection />
    </main>
  )
}
