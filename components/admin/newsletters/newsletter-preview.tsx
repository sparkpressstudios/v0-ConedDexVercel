interface NewsletterPreviewProps {
  subject: string
  content: string
}

export default function NewsletterPreview({ subject, content }: NewsletterPreviewProps) {
  return (
    <div className="space-y-4">
      <div className="border-b pb-2">
        <h3 className="text-lg font-medium">Subject: {subject || "No subject"}</h3>
      </div>

      <div className="prose max-w-none">
        {content ? (
          <div dangerouslySetInnerHTML={{ __html: content }} />
        ) : (
          <p className="text-muted-foreground">No content</p>
        )}
      </div>
    </div>
  )
}
