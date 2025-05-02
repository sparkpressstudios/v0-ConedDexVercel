"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { sendNewsletter } from "@/app/actions/newsletter-actions"
import { Loader2, Send } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface SendNewsletterFormProps {
  newsletterId: string
  newsletterTitle: string
  subject?: string
  content?: string
  recipientCount?: number
  onCancel: () => void
  onSuccess: () => void
}

export default function SendNewsletterForm({
  newsletterId,
  newsletterTitle,
  subject = "Newsletter",
  content = "",
  recipientCount = 0,
  onCancel,
  onSuccess,
}: SendNewsletterFormProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [testEmail, setTestEmail] = useState("")
  const { toast } = useToast()

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Email required",
        description: "Please enter an email address to send the test to.",
        variant: "destructive",
      })
      return
    }

    setIsSending(true)
    try {
      const result = await sendNewsletter({
        subject,
        content,
        testOnly: true,
        testEmail,
      })

      if (result.success) {
        toast({
          title: "Test email sent",
          description: `Test newsletter sent to ${testEmail}`,
        })
        setTestEmail("")
      } else {
        throw new Error(result.message || "Failed to send test email")
      }
    } catch (error) {
      toast({
        title: "Failed to send test",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  const handleSendToAll = async () => {
    setIsSending(true)
    try {
      const result = await sendNewsletter({
        subject,
        content,
      })

      if (result.success) {
        toast({
          title: "Newsletter sent",
          description: result.message || "Newsletter sent successfully",
        })
        onSuccess()
      } else {
        throw new Error(result.message || "Failed to send newsletter")
      }
    } catch (error) {
      toast({
        title: "Failed to send newsletter",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Newsletter: {newsletterTitle}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} disabled />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="recipients">Recipients</Label>
          <div className="text-sm text-muted-foreground">
            This newsletter will be sent to approximately {recipientCount} subscribers.
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="test-email">Send a test first</Label>
          <div className="flex gap-2">
            <Input
              id="test-email"
              placeholder="your@email.com"
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
            />
            <Button variant="outline" onClick={handleSendTest} disabled={isSending || !testEmail}>
              {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Test"}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel} disabled={isSending}>
          Cancel
        </Button>
        <Button onClick={handleSendToAll} disabled={isSending}>
          {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
          Send to All
        </Button>
      </CardFooter>
    </Card>
  )
}
