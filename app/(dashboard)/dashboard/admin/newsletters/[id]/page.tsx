import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { NewsletterPreview } from "@/components/admin/newsletters/newsletter-preview"
import Link from "next/link"
import { ArrowLeft, Clock, Mail, Send, User } from "lucide-react"

export default async function NewsletterDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch newsletter details
  const { data: newsletter, error } = await supabase
    .from("newsletters")
    .select(`
      *,
      profiles:created_by (
        email,
        full_name
      )
    `)
    .eq("id", params.id)
    .single()

  if (error || !newsletter) {
    notFound()
  }

  // Format dates
  const createdAt = new Date(newsletter.created_at).toLocaleString()
  const sentAt = newsletter.sent_at ? new Date(newsletter.sent_at).toLocaleString() : null

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/admin/newsletters">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Newsletters
          </Link>
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{newsletter.subject}</h1>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Badge
              variant={
                newsletter.status === "sent"
                  ? "success"
                  : newsletter.status === "draft"
                    ? "outline"
                    : newsletter.status === "partial_send"
                      ? "warning"
                      : "secondary"
              }
            >
              {newsletter.status}
            </Badge>
            {newsletter.recipient_count && (
              <span className="text-sm">Sent to {newsletter.recipient_count} recipients</span>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {newsletter.status === "draft" && (
            <Button>
              <Send className="h-4 w-4 mr-2" />
              Send Newsletter
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href={`/dashboard/admin/newsletters/${params.id}/edit`}>Edit</Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Newsletter Content</CardTitle>
            <CardDescription>Preview of the newsletter content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: newsletter.content }} />
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Created by</div>
                  <div className="text-sm text-muted-foreground">{newsletter.profiles?.full_name || "Unknown"}</div>
                </div>

                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">Created at</div>
                  <div className="text-sm text-muted-foreground">{createdAt}</div>
                </div>

                {sentAt && (
                  <>
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Sent at</div>
                      <div className="text-sm text-muted-foreground">{sentAt}</div>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <NewsletterPreview subject={newsletter.subject} content={newsletter.content} />
        </div>
      </div>
    </div>
  )
}
