export function PartnersSection() {
  const partners = [
    { name: "Swirling Ice Cream Foundation", logo: "/swirling-ice-cream-foundation.png" },
    { name: "Frozen Data", logo: "/frozen-data.png" },
    { name: "Growth Arrow", logo: "/growth-arrow-logo.png" },
    { name: "Pasture Promise", logo: "/pasture-promise.png" },
    { name: "Crispy Cone Crest", logo: "/crispy-cone-crest.png" },
    { name: "Vibrant Flavor Burst", logo: "/vibrant-flavor-burst.png" },
  ]

  return (
    <section className="bg-gray-50 py-16 dark:bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">Our Partners</h2>
          <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400">
            We're proud to work with these amazing organizations to bring you the best ice cream experience.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
          {partners.map((partner, index) => (
            <div key={index} className="flex items-center justify-center">
              <img
                src={partner.logo || "/placeholder.svg"}
                alt={partner.name}
                className="max-h-16 max-w-full grayscale transition-all hover:grayscale-0"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
