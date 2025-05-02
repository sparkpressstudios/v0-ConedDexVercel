"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Edit, Eye, Send } from "lucide-react"
import Link from "next/link"

interface NewsletterItemProps {
  newsletter: {
    id: string
    subject: string
    content: string
    created_at: string
    sent_at: string | null
    recipient_count: number | null
    status: string
  }
  onSendClick: (newsletter: any) => void
}

export function NewsletterItem({ newsletter, onSendClick }: NewsletterItemProps) {
  // Format the date
  const formattedDate = new Date(newsletter.created_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Truncate content for preview
  const contentPreview = newsletter.content.replace(/<[^>]*>/g, "").substring(0, 120) + "..."

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{newsletter.subject}</CardTitle>
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
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5 mr-1" />
          <span>{formattedDate}</span>
          {newsletter.sent_at && <span className="ml-2">• Sent to {newsletter.recipient_count} recipients</span>}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{contentPreview}</p>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/dashboard/admin/newsletters/${newsletter.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View
          </Link>
        </Button>
        <div className="flex gap-2">
          {newsletter.status === "draft" && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/dashboard/admin/newsletters/${newsletter.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Link>
              </Button>
              <Button size="sm" onClick={() => onSendClick(newsletter)}>
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </>
          )}
          {newsletter.status !== "draft" && (
            <Button variant="outline" size="sm" asChild>
              <Link href={`/dashboard/admin/newsletters/${newsletter.id}`}>Details</Link>
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
