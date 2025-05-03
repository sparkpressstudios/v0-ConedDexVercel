"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import NewsletterForm from "./newsletter-form"
import SendNewsletterForm from "./send-newsletter-form"
import { createNewsletter } from "@/app/actions/newsletter-actions"
import { useToast } from "@/hooks/use-toast"
import { NewsletterItem } from "./newsletter-item"

interface Newsletter {
  id: string
  title: string
  subject: string
  content: string
  created_at: string
  sent_at: string | null
  recipient_count: number | null
}

interface NewsletterListProps {
  newsletters: Newsletter[]
}

export default function NewsletterList({ newsletters }: NewsletterListProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const { toast } = useToast()

  async function handleCreateNewsletter(data: Partial<Newsletter>) {
    try {
      const result = await createNewsletter({
        title: data.title!,
        subject: data.subject!,
        content: data.content!,
      })

      if (result.error) {
        toast({
          title: "Error",
          description: result.error,
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Success",
        description: "Newsletter created successfully",
      })
      setIsCreating(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  function handleSendClick(newsletter: Newsletter) {
    setSelectedNewsletter(newsletter)
    setIsSending(true)
  }

  function handleSendSuccess() {
    setIsSending(false)
    setSelectedNewsletter(null)
    toast({
      title: "Success",
      description: "Newsletter sent successfully",
    })
  }

  if (isCreating) {
    return (
      <div className="space-y-6">
        <NewsletterForm onSubmit={handleCreateNewsletter} onCancel={() => setIsCreating(false)} />
      </div>
    )
  }

  if (isSending && selectedNewsletter) {
    return (
      <div className="space-y-6">
        <SendNewsletterForm
          newsletterId={selectedNewsletter.id}
          newsletterTitle={selectedNewsletter.title}
          onCancel={() => {
            setIsSending(false)
            setSelectedNewsletter(null)
          }}
          onSuccess={handleSendSuccess}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Newsletters</h2>
        <Button onClick={() => setIsCreating(true)}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Newsletter
        </Button>
      </div>

      {newsletters.length === 0 ? (
        <div className="text-center py-10 border rounded-md">
          <p className="text-muted-foreground">No newsletters created yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {newsletters.map((newsletter) => (
            <NewsletterItem key={newsletter.id} newsletter={newsletter} onSendClick={handleSendClick} />
          ))}
        </div>
      )}
    </div>
  )
}
