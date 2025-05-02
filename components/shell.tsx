import type React from "react"
import { cn } from "@/lib/utils"

interface ShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  layout?: "default" | "dashboard" | "auth" | "centered" | "full"
  className?: string
}

export function Shell({ children, layout = "default", className, ...props }: ShellProps) {
  return (
    <div
      className={cn(
        "w-full",
        layout === "default" && "container mx-auto px-4 md:px-6 py-6 md:py-8",
        layout === "dashboard" && "container mx-auto px-4 md:px-6 py-4 md:py-6",
        layout === "auth" && "container mx-auto px-4 max-w-md py-12",
        layout === "centered" && "container mx-auto px-4 max-w-2xl py-8 md:py-12",
        layout === "full" && "px-0 py-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
