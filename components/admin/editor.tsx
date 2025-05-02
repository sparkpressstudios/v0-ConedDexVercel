"use client"

import { useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"

interface EditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export default function Editor({ value, onChange, placeholder }: EditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize the textarea based on content
  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return

    const adjustHeight = () => {
      textarea.style.height = "auto"
      textarea.style.height = `${textarea.scrollHeight}px`
    }

    // Set initial height
    adjustHeight()

    // Add event listener for input
    textarea.addEventListener("input", adjustHeight)

    // Cleanup
    return () => {
      textarea.removeEventListener("input", adjustHeight)
    }
  }, [value])

  return (
    <div className="relative border rounded-md">
      <div className="flex items-center gap-2 p-2 border-b bg-muted/50">
        <button
          type="button"
          className="p-1 rounded hover:bg-muted"
          onClick={() => {
            onChange(value + "<h2>Heading</h2>")
          }}
          title="Add Heading"
        >
          H2
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted"
          onClick={() => {
            onChange(value + "<strong>Bold text</strong>")
          }}
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted italic"
          onClick={() => {
            onChange(value + "<em>Italic text</em>")
          }}
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted"
          onClick={() => {
            onChange(value + "<ul><li>List item</li></ul>")
          }}
          title="Bulleted List"
        >
          • List
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted"
          onClick={() => {
            onChange(value + '<a href="https://example.com">Link text</a>')
          }}
          title="Add Link"
        >
          🔗 Link
        </button>
        <button
          type="button"
          className="p-1 rounded hover:bg-muted"
          onClick={() => {
            onChange(
              value +
                '<div class="button" style="display: inline-block; background-color: #f8a100; color: white; text-decoration: none; padding: 10px 20px; border-radius: 5px; margin: 20px 0;">Button Text</div>',
            )
          }}
          title="Add Button"
        >
          Button
        </button>
      </div>

      <Textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-h-[300px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />

      <div className="p-2 border-t bg-muted/50 text-xs text-muted-foreground">
        <p>HTML formatting is supported. Use the toolbar to add common elements.</p>
      </div>
    </div>
  )
}
