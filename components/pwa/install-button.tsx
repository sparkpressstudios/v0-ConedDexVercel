"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import { Download } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

interface InstallButtonProps extends ButtonProps {
  children: React.ReactNode
}

export function InstallButton({ children, className, ...props }: InstallButtonProps) {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true) {
      setIsStandalone(true)
    }

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Listen for app installed event
    window.addEventListener("appinstalled", () => {
      setIsInstallable(false)
      setIsStandalone(true)
      toast({
        title: "ConeDex Installed!",
        description: "Thanks for installing ConeDex. You can now access it from your home screen.",
      })
    })

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      // If no install prompt is available, show instructions
      toast({
        title: "Installation Instructions",
        description: "To install ConeDex, tap the browser menu and select 'Add to Home Screen' or 'Install'.",
        duration: 5000,
      })
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const choiceResult = await deferredPrompt.userChoice

    if (choiceResult.outcome === "accepted") {
      console.log("User accepted the install prompt")
    } else {
      console.log("User dismissed the install prompt")
    }

    // Clear the saved prompt as it can't be used again
    setDeferredPrompt(null)
  }

  if (isStandalone) {
    return (
      <Button className={className} variant="outline" disabled {...props}>
        Already Installed
      </Button>
    )
  }

  return (
    <Button onClick={handleInstallClick} className={className} {...props}>
      {children}
      <Download className="ml-2 h-5 w-5 relative z-10 group-hover:animate-pulse" />
    </Button>
  )
}
