"use client"

import { useEffect, useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getNewsletters } from "@/app/actions/newsletter-actions"
import { NewsletterListSkeleton } from "./newsletter-skeleton"
import NewsletterList from "./newsletter-list"
import NewsletterForm from "./newsletter-form"
import { useToast } from "@/hooks/use-toast"

interface Newsletter {
  id: string
  subject: string
  content: string
  created_at: string
  sent_at: string | null
  recipient_count: number | null
  status: string
  profiles: {
    email: string
    full_name: string
  }
}

export default function NewsletterDashboard() {
  const [newsletters, setNewsletters] = useState<Newsletter[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("list")
  const { toast } = useToast()

  useEffect(() => {
    async function loadNewsletters() {
      try {
        const data = await getNewsletters()
        setNewsletters(data || [])
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load newsletters",
          variant: "destructive",
        })
        console.error("Error loading newsletters:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNewsletters()
  }, [toast])

  const handleCreateSuccess = () => {
    setActiveTab("list")
    // Reload newsletters
    setIsLoading(true)
    getNewsletters()
      .then((data) => {
        setNewsletters(data || [])
      })
      .catch((error) => {
        toast({
          title: "Error",
          description: "Failed to refresh newsletters",
          variant: "destructive",
        })
      })
      .finally(() => {
        setIsLoading(false)
      })
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="mb-6">
        <TabsTrigger value="list">All Newsletters</TabsTrigger>
        <TabsTrigger value="create">Create New</TabsTrigger>
      </TabsList>

      <TabsContent value="list">
        {isLoading ? <NewsletterListSkeleton /> : <NewsletterList newsletters={newsletters} />}
      </TabsContent>

      <TabsContent value="create">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Create Newsletter</h2>
          <NewsletterForm onSuccess={handleCreateSuccess} />
        </div>
      </TabsContent>
    </Tabs>
  )
}
