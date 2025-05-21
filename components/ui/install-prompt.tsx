"use client"

import { useEffect, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Only run this in production to avoid development console noise
    if (process.env.NODE_ENV !== "production") {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Store the event for later use
      // Do NOT call preventDefault() here to avoid the console warning
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      // Show the install button
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Check if the app is already installed
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true

    if (isStandalone) {
      // App is already installed, don't show the prompt
      setShowPrompt(false)
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    deferredPrompt.userChoice.then((choiceResult) => {
      // Clear the saved prompt since it can't be used again
      setDeferredPrompt(null)
      setShowPrompt(false)
    })
  }

  if (!showPrompt) return null

  return (
    <Card className="fixed bottom-4 right-4 max-w-sm z-50 shadow-lg">
      <CardHeader>
        <CardTitle>Install ConeDex</CardTitle>
        <CardDescription>Install ConeDex on your device for a better experience</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Get quick access to your ice cream adventures, even when offline!
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setShowPrompt(false)}>
          Not now
        </Button>
        <Button onClick={handleInstallClick}>
          <Download className="mr-2 h-4 w-4" />
          Install
        </Button>
      </CardFooter>
    </Card>
  )
}
