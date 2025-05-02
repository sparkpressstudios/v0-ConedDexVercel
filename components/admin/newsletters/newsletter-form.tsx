"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createNewsletter, sendNewsletter } from "@/app/actions/newsletter-actions"
import { useToast } from "@/hooks/use-toast"
import Editor from "@/components/admin/editor"

// Define form validation schema
const formSchema = z.object({
  subject: z
    .string()
    .min(5, { message: "Subject must be at least 5 characters" })
    .max(100, { message: "Subject cannot exceed 100 characters" }),
  content: z
    .string()
    .min(20, { message: "Content must be at least 20 characters" })
    .max(50000, { message: "Content cannot exceed 50,000 characters" }),
  testEmail: z.string().email({ message: "Please enter a valid email" }).optional(),
})

type NewsletterFormValues = z.infer<typeof formSchema>

interface NewsletterFormProps {
  onSuccess?: () => void
}

export default function NewsletterForm({ onSuccess }: NewsletterFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSendingTest, setIsSendingTest] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const { toast } = useToast()

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      content: "",
      testEmail: "",
    },
  })

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true)
    try {
      await createNewsletter({
        subject: data.subject,
        content: data.content,
      })

      toast({
        title: "Newsletter created",
        description: "Your newsletter has been saved and is ready to send",
      })

      form.reset()
      if (onSuccess) onSuccess()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create newsletter",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendTest = async () => {
    const testEmail = form.getValues("testEmail")
    if (!testEmail) {
      toast({
        title: "Error",
        description: "Please enter a test email address",
        variant: "destructive",
      })
      return
    }

    setIsSendingTest(true)
    try {
      await sendNewsletter({
        subject: form.getValues("subject"),
        content: form.getValues("content"),
        testOnly: true,
        testEmail,
      })

      toast({
        title: "Test email sent",
        description: `A test email has been sent to ${testEmail}`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test email",
        variant: "destructive",
      })
    } finally {
      setIsSendingTest(false)
    }
  }

  const generatePreview = () => {
    const content = form.getValues("content")
    const subject = form.getValues("subject")

    // Simple HTML preview
    setPreviewHtml(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
        <h1 style="color: #FF6B6B;">${subject}</h1>
        <div>${content}</div>
        <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center;">
          <p>© ${new Date().getFullYear()} ConeDex. All rights reserved.</p>
        </div>
      </div>
    `)
  }

  return (
    <Tabs defaultValue="compose">
      <TabsList className="mb-4">
        <TabsTrigger value="compose">Compose</TabsTrigger>
        <TabsTrigger value="preview" onClick={generatePreview}>
          Preview
        </TabsTrigger>
      </TabsList>

      <TabsContent value="compose">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Newsletter subject" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Editor
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Write your newsletter content here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
              <FormField
                control={form.control}
                name="testEmail"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Test Email (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="button"
                variant="outline"
                onClick={handleSendTest}
                disabled={isSendingTest}
                className="mt-8"
              >
                {isSendingTest ? "Sending..." : "Send Test"}
              </Button>
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save Newsletter"}
            </Button>
          </form>
        </Form>
      </TabsContent>

      <TabsContent value="preview">
        <Card>
          <CardContent className="p-6">
            <div className="mb-4 pb-4 border-b">
              <h3 className="text-sm font-medium text-gray-500">Preview</h3>
            </div>
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
