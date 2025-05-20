"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function PublicHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const routes = [
    {
      href: "/",
      label: "Home",
    },
    {
      href: "/features",
      label: "Features",
    },
    {
      href: "/shops",
      label: "Explore Shops",
    },
    {
      href: "/conedex",
      label: "ConeDex",
    },
    {
      href: "/business",
      label: "For Businesses",
    },
    {
      href: "/pricing",
      label: "Pricing",
    },
    {
      href: "/sponsors",
      label: "Sponsors",
    },
    {
      href: "/contact",
      label: "Contact",
    },
  ]

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-200",
        scrolled
          ? "border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
          : "bg-background",
      )}
    >
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            {/* Logo */}
            <div className="relative h-8 w-8 overflow-hidden">
              <Image
                src="/icons/icon-192x192.png"
                alt="ConeDex Logo"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <span className="text-xl font-bold">ConeDex</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden gap-6 md:flex">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === route.href ? "text-primary" : "text-muted-foreground",
                )}
              >
                {route.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex sm:gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-pink-600 hover:bg-pink-700">Sign Up</Button>
            </Link>
          </div>

          {/* Mobile Navigation */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <Image
                    src="/icons/icon-192x192.png"
                    alt="ConeDex Logo"
                    width={24}
                    height={24}
                    className="object-contain"
                  />
                  <span className="font-bold">ConeDex</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <nav className="mt-6 flex flex-col gap-4">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                <div className="mt-4 flex flex-col gap-2">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">Sign Up</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
