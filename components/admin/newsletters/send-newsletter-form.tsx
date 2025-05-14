"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"

export default function SendNewsletterForm() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)

    try {
      // For v0.dev preview, we'll just log the newsletter details
      console.log("Newsletter would be sent with subject:", subject)
      console.log("Content:", content)

      // Mock successful sending
      setTimeout(() => {
        toast({
          title: "Newsletter Sent",
          description: "Your newsletter has been sent successfully (preview mode).",
        })
        setSending(false)
        setSubject("")
        setContent("")
      }, 1000)
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: "Failed to send newsletter. Please try again.",
        variant: "destructive",
      })
      setSending(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Send Newsletter</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Newsletter Subject"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your newsletter content here..."
              rows={10}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send Newsletter"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
