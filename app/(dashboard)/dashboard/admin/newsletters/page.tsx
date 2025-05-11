import type { Metadata } from "next"
import NewsletterDashboard from "@/components/admin/newsletters/newsletter-dashboard"

export const metadata: Metadata = {
  title: "Newsletter Management | ConeDex Admin",
  description: "Create and send newsletters to ConeDex users",
}

export default function NewslettersPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Newsletter Management</h1>
      <NewsletterDashboard />
    </div>
  )
}
