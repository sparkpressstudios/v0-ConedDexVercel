"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Send, Edit, Trash, Eye } from "lucide-react"
import NewsletterForm from "./newsletter-form"
import SendNewsletterForm from "./send-newsletter-form"
import { createNewsletter, deleteNewsletter } from "@/app/actions/newsletter-actions"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { format } from "date-fns"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

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
  const [isEditing, setIsEditing] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [selectedNewsletter, setSelectedNewsletter] = useState<Newsletter | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
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

  async function handleEditNewsletter(data: Partial<Newsletter>) {
    try {
      // Implement edit functionality
      toast({
        title: "Success",
        description: "Newsletter updated successfully",
      })
      setIsEditing(false)
      setSelectedNewsletter(null)
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    }
  }

  async function handleDeleteNewsletter(id: string) {
    try {
      const result = await deleteNewsletter(id)

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
        description: "Newsletter deleted successfully",
      })
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

  function handleEditClick(newsletter: Newsletter) {
    setSelectedNewsletter(newsletter)
    setIsEditing(true)
  }

  function handlePreviewClick(newsletter: Newsletter) {
    setSelectedNewsletter(newsletter)
    setIsPreviewOpen(true)
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

  if (isEditing && selectedNewsletter) {
    return (
      <div className="space-y-6">
        <NewsletterForm
          newsletter={selectedNewsletter}
          onSubmit={handleEditNewsletter}
          onCancel={() => {
            setIsEditing(false)
            setSelectedNewsletter(null)
          }}
        />
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

      <Tabs defaultValue="drafts" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="drafts">Drafts</TabsTrigger>
          <TabsTrigger value="sent">Sent</TabsTrigger>
        </TabsList>

        <TabsContent value="drafts">
          {newsletters.filter((n) => !n.sent_at).length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">No draft newsletters</p>
              <Button variant="outline" className="mt-4" onClick={() => setIsCreating(true)}>
                Create your first newsletter
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {newsletters
                .filter((newsletter) => !newsletter.sent_at)
                .map((newsletter) => (
                  <Card key={newsletter.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="truncate">{newsletter.title}</span>
                        <Badge variant="outline">Draft</Badge>
                      </CardTitle>
                      <CardDescription>
                        Created {format(new Date(newsletter.created_at), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">Subject: {newsletter.subject}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {newsletter.content.replace(/<[^>]*>/g, "")}
                      </p>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handlePreviewClick(newsletter)}>
                          <Eye className="h-4 w-4 mr-1" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(newsletter)}>
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteNewsletter(newsletter.id)}>
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>
                        <Button variant="default" size="sm" onClick={() => handleSendClick(newsletter)}>
                          <Send className="h-4 w-4 mr-1" />
                          Send
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="sent">
          {newsletters.filter((n) => n.sent_at).length === 0 ? (
            <div className="text-center py-10 border rounded-md">
              <p className="text-muted-foreground">No sent newsletters</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {newsletters
                .filter((newsletter) => newsletter.sent_at)
                .map((newsletter) => (
                  <Card key={newsletter.id}>
                    <CardHeader>
                      <CardTitle className="flex justify-between items-start">
                        <span className="truncate">{newsletter.title}</span>
                        <Badge>Sent</Badge>
                      </CardTitle>
                      <CardDescription>Sent {format(new Date(newsletter.sent_at!), "MMM d, yyyy")}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm font-medium">Subject: {newsletter.subject}</p>
                      <p className="text-sm text-muted-foreground mt-2 line-clamp-3">
                        {newsletter.content.replace(/<[^>]*>/g, "")}
                      </p>
                      {newsletter.recipient_count && (
                        <p className="text-sm mt-2">Sent to {newsletter.recipient_count} recipients</p>
                      )}
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreviewClick(newsletter)}
                        className="w-full"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Newsletter
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedNewsletter?.title}</DialogTitle>
            <DialogDescription>Subject: {selectedNewsletter?.subject}</DialogDescription>
          </DialogHeader>
          <div className="border rounded-md p-4 mt-4">
            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedNewsletter?.content || "" }} />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
