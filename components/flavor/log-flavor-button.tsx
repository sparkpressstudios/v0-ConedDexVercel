"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { LogFlavorForm } from "./log-flavor-form"

interface LogFlavorButtonProps extends React.ComponentProps<typeof Button> {
  children?: React.ReactNode
}

// Named export
export function LogFlavorButton({ children, ...props }: LogFlavorButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} {...props}>
        {children || (
          <>
            <span className="mr-2">🍦</span> Log Flavor
          </>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Log a New Flavor</DialogTitle>
            <DialogDescription>Record your ice cream discoveries and build your ConeDex collection!</DialogDescription>
          </DialogHeader>
          <LogFlavorForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}

// Default export
export default LogFlavorButton
