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
import { useToast } from "@/hooks/use-toast"
import Editor from "@/components/admin/editor"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

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
})

type NewsletterFormValues = z.infer<typeof formSchema>

interface NewsletterEditFormProps {
  newsletter: {
    id: string
    subject: string
    content: string
  }
}

export default function NewsletterEditForm({ newsletter }: NewsletterEditFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewHtml, setPreviewHtml] = useState("")
  const { toast } = useToast()
  const router = useRouter()
  const supabase = createClient()

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: newsletter.subject,
      content: newsletter.content,
    },
  })

  const onSubmit = async (data: NewsletterFormValues) => {
    setIsSubmitting(true)
    try {
      const { error } = await supabase
        .from("newsletters")
        .update({
          subject: data.subject,
          content: data.content,
        })
        .eq("id", newsletter.id)

      if (error) throw error

      toast({
        title: "Newsletter updated",
        description: "Your newsletter has been updated successfully",
      })

      router.push(`/dashboard/admin/newsletters/${newsletter.id}`)
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update newsletter",
        variant: "destructive",
      })
      console.error("Error updating newsletter:", error)
    } finally {
      setIsSubmitting(false)
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
        <TabsTrigger value="compose">Edit</TabsTrigger>
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

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/dashboard/admin/newsletters/${newsletter.id}`)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
            </div>
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
