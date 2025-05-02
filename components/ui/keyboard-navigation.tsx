"use client"

import { useRef, useEffect, type KeyboardEvent, type ReactNode } from "react"

interface KeyboardNavigationProps {
  children: ReactNode
  selector: string
  orientation?: "horizontal" | "vertical" | "both"
  loop?: boolean
  onEscape?: () => void
  disabled?: boolean
  className?: string
}

export function KeyboardNavigation({
  children,
  selector,
  orientation = "vertical",
  loop = true,
  onEscape,
  disabled = false,
  className,
}: KeyboardNavigationProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Focus the first element when the component mounts
    if (!disabled && containerRef.current) {
      const firstElement = containerRef.current.querySelector(selector) as HTMLElement
      if (firstElement) {
        firstElement.setAttribute("tabIndex", "0")
      }
    }
  }, [disabled, selector])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return

    const container = containerRef.current
    if (!container) return

    const elements = Array.from(container.querySelectorAll(selector)) as HTMLElement[]
    if (elements.length === 0) return

    const currentElement = document.activeElement as HTMLElement
    const currentIndex = elements.indexOf(currentElement)

    let nextIndex = -1

    switch (event.key) {
      case "ArrowDown":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault()
          nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex
        }
        break
      case "ArrowUp":
        if (orientation === "vertical" || orientation === "both") {
          event.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : loop ? elements.length - 1 : currentIndex
        }
        break
      case "ArrowRight":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault()
          nextIndex = currentIndex < elements.length - 1 ? currentIndex + 1 : loop ? 0 : currentIndex
        }
        break
      case "ArrowLeft":
        if (orientation === "horizontal" || orientation === "both") {
          event.preventDefault()
          nextIndex = currentIndex > 0 ? currentIndex - 1 : loop ? elements.length - 1 : currentIndex
        }
        break
      case "Home":
        event.preventDefault()
        nextIndex = 0
        break
      case "End":
        event.preventDefault()
        nextIndex = elements.length - 1
        break
      case "Escape":
        event.preventDefault()
        onEscape?.()
        break
    }

    if (nextIndex !== -1) {
      elements.forEach((el) => el.setAttribute("tabIndex", "-1"))
      elements[nextIndex].setAttribute("tabIndex", "0")
      elements[nextIndex].focus()
    }
  }

  return (
    <div ref={containerRef} onKeyDown={handleKeyDown} className={className}>
      {children}
    </div>
  )
}
