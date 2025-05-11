"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { sendNewsletter } from "@/app/actions/newsletter-actions"
import { toast } from "@/components/ui/use-toast"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface SendNewsletterFormProps {
  newsletterId: string
  subject: string
  content: string
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export default function SendNewsletterForm({
  newsletterId,
  subject,
  content,
  isOpen,
  onClose,
  onSuccess,
}: SendNewsletterFormProps) {
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    setIsSending(true)
    try {
      await sendNewsletter({
        subject,
        content,
      })

      toast({
        title: "Newsletter sent",
        description: "Your newsletter has been sent to all subscribers",
      })

      if (onSuccess) onSuccess()
      onClose()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send newsletter",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Newsletter</DialogTitle>
          <DialogDescription>This will send the newsletter to all subscribed users.</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 text-amber-800 rounded-md mb-4">
            <AlertTriangle className="h-5 w-5" />
            <p className="text-sm">This action cannot be undone.</p>
          </div>

          <div className="space-y-4">
            <div className="border rounded-md p-3 bg-gray-50">
              <p className="font-medium text-sm">Subject:</p>
              <p className="text-sm">{subject}</p>
            </div>

            <div className="border rounded-md p-3 bg-gray-50 max-h-60 overflow-y-auto">
              <p className="font-medium text-sm mb-1">Preview:</p>
              <div className="text-sm prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: content }} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={isSending}>
            {isSending ? "Sending..." : "Send Newsletter"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
