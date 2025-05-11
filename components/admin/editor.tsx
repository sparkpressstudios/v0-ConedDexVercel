"use client"

import { useState } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const [preview, setPreview] = useState("")

  const handleTabChange = (value: string) => {
    if (value === "preview") {
      setPreview(value)
    }
  }

  return (
    <Tabs defaultValue="write" onValueChange={handleTabChange}>
      <TabsList className="mb-2">
        <TabsTrigger value="write">Write</TabsTrigger>
        <TabsTrigger value="preview">Preview</TabsTrigger>
      </TabsList>

      <TabsContent value="write">
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[300px] font-mono"
        />
      </TabsContent>

      <TabsContent value="preview">
        <div
          className="min-h-[300px] p-4 border rounded-md bg-white prose max-w-none"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      </TabsContent>
    </Tabs>
  )
}
