import { createClient } from "@/lib/supabase/server"
import { notFound, redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import NewsletterEditForm from "@/components/admin/newsletters/newsletter-edit-form"

export default async function EditNewsletterPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch newsletter details
  const { data: newsletter, error } = await supabase.from("newsletters").select("*").eq("id", params.id).single()

  if (error || !newsletter) {
    notFound()
  }

  // Don't allow editing of sent newsletters
  if (newsletter.status === "sent") {
    redirect(`/dashboard/admin/newsletters/${params.id}`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/admin/newsletters/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletter
          </Link>
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold">Edit Newsletter</h1>
        <p className="text-muted-foreground">Update the content of your newsletter</p>
      </div>

      <div className="max-w-3xl">
        <NewsletterEditForm newsletter={newsletter} />
      </div>
    </div>
  )
}
