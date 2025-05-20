"use client"

import { type ReactNode, useState } from "react"
import { Button } from "@/components/ui/button"
import { LogFlavorModal } from "./log-flavor-modal"

interface LogFlavorButtonProps {
  children?: ReactNode
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  className?: string
}

export function LogFlavorButton({ children, variant = "default", className }: LogFlavorButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  return (
    <>
      <Button onClick={openModal} variant={variant} className={className}>
        {children || "Log Flavor"}
      </Button>
      <LogFlavorModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  )
}

// Add default export
export default LogFlavorButton
