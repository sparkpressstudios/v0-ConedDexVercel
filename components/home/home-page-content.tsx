import { HeroSection } from "./hero-section"
import { FeaturesSection } from "./features-section"
import { StatsSection } from "./stats-section"
import { TestimonialsSection } from "./testimonials-section"
import { PricingSection } from "./pricing-section"
import { PartnersSection } from "./partners-section"
import { CTASection } from "./cta-section"

export function HomePageContent() {
  return (
    <div className="flex flex-col items-center">
      <HeroSection />
      <FeaturesSection />
      <StatsSection />
      <TestimonialsSection />
      <PricingSection />
      <PartnersSection />
      <CTASection />
    </div>
  )
}
