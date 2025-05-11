"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import NewsletterForm from "./newsletter-form"
import NewsletterList from "./newsletter-list"

export default function NewsletterDashboard() {
  const [activeTab, setActiveTab] = useState("create")

  return (
    <Tabs defaultValue="create" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-8">
        <TabsTrigger value="create">Create Newsletter</TabsTrigger>
        <TabsTrigger value="history">Newsletter History</TabsTrigger>
      </TabsList>

      <TabsContent value="create" className="space-y-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Create New Newsletter</h2>
          <NewsletterForm onSuccess={() => setActiveTab("history")} />
        </div>
      </TabsContent>

      <TabsContent value="history">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Newsletter History</h2>
          <NewsletterList />
        </div>
      </TabsContent>
    </Tabs>
  )
}
