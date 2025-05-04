export function StatsSection() {
  const stats = [
    { value: "10,000+", label: "Ice Cream Flavors" },
    { value: "5,000+", label: "Ice Cream Shops" },
    { value: "50,000+", label: "Active Users" },
    { value: "100,000+", label: "Flavor Reviews" },
  ]

  return (
    <section className="bg-primary py-16 text-primary-foreground">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="mb-4 text-3xl font-bold sm:text-4xl">ConeDex by the Numbers</h2>
          <p className="mx-auto max-w-2xl">
            Join our growing community of ice cream enthusiasts and discover why ConeDex is the ultimate ice cream
            companion.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold md:text-5xl">{stat.value}</div>
              <div className="mt-2 text-sm font-medium md:text-base">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
