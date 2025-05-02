"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Smartphone, Monitor } from "lucide-react"

interface NewsletterPreviewProps {
  subject: string
  content: string
}

export function NewsletterPreview({ subject, content }: NewsletterPreviewProps) {
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop")

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Preview</CardTitle>
        <div className="flex items-center space-x-1">
          <Button
            variant={viewMode === "desktop" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("desktop")}
            title="Desktop view"
          >
            <Monitor className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === "mobile" ? "default" : "ghost"}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode("mobile")}
            title="Mobile view"
          >
            <Smartphone className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div
          className={`border rounded-md overflow-hidden ${viewMode === "mobile" ? "max-w-[375px] mx-auto" : "w-full"}`}
        >
          <div className="bg-gray-100 p-2 border-b">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="text-xs text-gray-500 ml-2 truncate">{subject}</div>
            </div>
          </div>
          <div
            className={`bg-white p-4 ${viewMode === "mobile" ? "text-sm" : ""}`}
            style={{ maxHeight: "300px", overflow: "auto" }}
          >
            <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
