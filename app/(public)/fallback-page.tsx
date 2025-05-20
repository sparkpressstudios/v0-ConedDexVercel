"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

export default function FallbackPage() {
  return (
    <div className="container mx-auto flex min-h-[50vh] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <CardTitle>Display Issue Detected</CardTitle>
          </div>
          <CardDescription>We're having trouble displaying this page. Our team has been notified.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You can try refreshing the page or clearing your browser cache. If the problem persists, please contact
            support.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={() => window.location.reload()} className="w-full">
            Refresh Page
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/">Return Home</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
