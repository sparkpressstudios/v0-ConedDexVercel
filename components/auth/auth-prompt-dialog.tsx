"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { LoginPanel } from "@/components/auth/login-panel"

interface AuthPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  redirectPath?: string
}

export function AuthPromptDialog({
  open,
  onOpenChange,
  title = "Sign in to continue",
  description = "Sign in or create an account to access all features",
  redirectPath = "/dashboard",
}: AuthPromptDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSuccess = () => {
    onOpenChange(false)
    router.refresh()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <LoginPanel
          redirectPath={redirectPath}
          onSuccess={handleSuccess}
          showSignupLink={true}
          showForgotPassword={true}
          showDemoAccess={true}
        />

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between sm:space-x-0">
          <Button variant="link" size="sm" className="px-0" onClick={() => onOpenChange(false)}>
            Continue as guest
          </Button>
          <Button variant="link" size="sm" onClick={() => router.push("/login")}>
            More options
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
