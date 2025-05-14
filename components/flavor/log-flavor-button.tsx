"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import LogFlavorModal from "./log-flavor-modal"

interface LogFlavorButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export default function LogFlavorButton({ variant = "default", size = "default", className }: LogFlavorButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <Button variant={variant} size={size} onClick={() => setIsModalOpen(true)} className={className}>
        <PlusCircle className="mr-2 h-4 w-4" />
        Log Flavor
      </Button>

      <LogFlavorModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </>
  )
}
