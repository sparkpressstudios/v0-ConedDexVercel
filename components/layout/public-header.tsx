"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu } from "lucide-react"
import { cn } from "@/lib/utils"

export function PublicHeader() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

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
      href: "/shops/map",
      label: "Explore",
    },
    {
      href: "/business",
      label: "For Businesses",
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
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative h-8 w-8">
              <Image src="/icons/icon-192x192.png" alt="ConeDex Logo" fill className="object-contain" />
            </div>
            <span className="text-xl font-bold">ConeDex</span>
          </Link>
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
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex items-center mb-6">
                <div className="relative h-8 w-8 mr-2">
                  <Image src="/icons/icon-192x192.png" alt="ConeDex Logo" fill className="object-contain" />
                </div>
                <span className="text-xl font-bold">ConeDex</span>
              </div>
              <nav className="grid gap-6 text-lg font-medium">
                {routes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "hover:text-primary",
                      pathname === route.href ? "text-primary" : "text-muted-foreground",
                    )}
                    onClick={() => setIsOpen(false)}
                  >
                    {route.label}
                  </Link>
                ))}
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link href="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
