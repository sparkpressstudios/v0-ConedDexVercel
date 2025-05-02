"use client"

import { useEffect } from "react"
import Link from "next/link"
import { IceCream } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-center">
      <IceCream className="h-16 w-16 text-pink-600" />
      <h1 className="mt-6 text-4xl font-bold">Something went wrong</h1>
      <p className="mt-4 max-w-md text-lg text-muted-foreground">
        We're sorry, but something unexpected happened. Our team has been notified and is working on a fix.
      </p>
      <div className="mt-8 flex gap-4">
        <Button onClick={() => reset()}>Try again</Button>
        <Button variant="outline" asChild>
          <Link href="/">Go Home</Link>
        </Button>
      </div>
    </div>
  )
}
