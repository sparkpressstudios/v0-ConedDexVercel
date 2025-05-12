"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { sendNewsletter } from "@/app/actions/newsletter-actions"
import { toast } from "@/components/ui/use-toast"

export function TestEmailButton({ subject, content }: { subject: string; content: string }) {
  const [isSending, setIsSending] = useState(false)
  const [testEmail, setTestEmail] = useState("")

  const handleSendTest = async () => {
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
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
          title: "Success",
          description: "Test email sent successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to send test email",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setIsSending(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="email"
        value={testEmail}
        onChange={(e) => setTestEmail(e.target.value)}
        placeholder="Enter test email"
        className="px-3 py-2 border rounded-md"
      />
      <Button onClick={handleSendTest} disabled={isSending}>
        {isSending ? "Sending..." : "Send Test"}
      </Button>
    </div>
  )
}
