"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, IceCream, Store, Search, MapPin, Award, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { Badge } from "@/components/ui/badge"

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
        <div className="flex items-center gap-6 md:gap-8">
          <Link href="/" className="flex items-center space-x-2">
            <IceCream className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">ConeDex</span>
          </Link>

          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Discover</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-pink-50 to-pink-100 p-6 no-underline outline-none focus:shadow-md"
                          href="/conedex"
                        >
                          <IceCream className="h-6 w-6 text-pink-500" />
                          <div className="mb-2 mt-4 text-lg font-medium">The ConeDex</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Explore our global database of ice cream flavors logged by users around the world.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/shops" title="Find Shops" icon={<MapPin className="h-4 w-4 mr-2 text-pink-500" />}>
                      Discover ice cream shops near you or in any location
                    </ListItem>
                    <ListItem
                      href="/flavors"
                      title="Popular Flavors"
                      icon={<Search className="h-4 w-4 mr-2 text-pink-500" />}
                    >
                      Browse trending and popular ice cream flavors
                    </ListItem>
                    <ListItem
                      href="/badges"
                      title="Badges & Rewards"
                      icon={<Award className="h-4 w-4 mr-2 text-pink-500" />}
                    >
                      See the achievements you can earn as an explorer
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/features" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Features</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger>For Businesses</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <a
                          className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-blue-50 to-blue-100 p-6 no-underline outline-none focus:shadow-md"
                          href="/business"
                        >
                          <Store className="h-6 w-6 text-blue-500" />
                          <div className="mb-2 mt-4 text-lg font-medium">Grow Your Business</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Connect with ice cream enthusiasts and increase visibility with our business tools.
                          </p>
                        </a>
                      </NavigationMenuLink>
                    </li>
                    <ListItem
                      href="/business/claim"
                      title="Claim Your Shop"
                      icon={<Store className="h-4 w-4 mr-2 text-blue-500" />}
                    >
                      Take control of your shop's profile on ConeDex
                    </ListItem>
                    <ListItem
                      href="/pricing"
                      title="Pricing Plans"
                      icon={<Info className="h-4 w-4 mr-2 text-blue-500" />}
                    >
                      View our transparent pricing options for businesses
                    </ListItem>
                    <ListItem
                      href="/business/success-stories"
                      title="Success Stories"
                      icon={<Award className="h-4 w-4 mr-2 text-blue-500" />}
                    >
                      See how other businesses have grown with ConeDex
                    </ListItem>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <Link href="/sponsors" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Sponsors</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex sm:gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-pink-600 hover:bg-pink-700">
                Sign Up
              </Button>
            </Link>
          </div>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
                  <IceCream className="h-5 w-5 text-pink-500" />
                  <span className="font-bold">ConeDex</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="mt-6 flex flex-col gap-6">
                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Discover</h4>
                  <nav className="flex flex-col gap-2">
                    <MobileNavLink href="/conedex" label="The ConeDex" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/shops" label="Find Shops" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/flavors" label="Popular Flavors" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/badges" label="Badges & Rewards" onClick={() => setIsOpen(false)} />
                  </nav>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">Information</h4>
                  <nav className="flex flex-col gap-2">
                    <MobileNavLink href="/features" label="Features" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/sponsors" label="Sponsors" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/contact" label="Contact" onClick={() => setIsOpen(false)} />
                  </nav>
                </div>

                <div className="flex flex-col gap-2">
                  <h4 className="text-sm font-medium text-muted-foreground">For Businesses</h4>
                  <nav className="flex flex-col gap-2">
                    <MobileNavLink href="/business" label="Business Overview" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/business/claim" label="Claim Your Shop" onClick={() => setIsOpen(false)} />
                    <MobileNavLink href="/pricing" label="Pricing Plans" onClick={() => setIsOpen(false)} />
                    <MobileNavLink
                      href="/business/success-stories"
                      label="Success Stories"
                      onClick={() => setIsOpen(false)}
                    />
                  </nav>
                </div>

                <div className="flex flex-col gap-3 pt-4">
                  <Link href="/login" onClick={() => setIsOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsOpen(false)}>
                    <Button className="w-full bg-pink-600 hover:bg-pink-700">Sign Up</Button>
                  </Link>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

interface ListItemProps {
  title: string
  href: string
  children: React.ReactNode
  icon?: React.ReactNode
}

const ListItem = ({ title, href, children, icon }: ListItemProps) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          href={href}
          className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          <div className="flex items-center text-sm font-medium leading-none">
            {icon}
            {title}
          </div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  )
}

interface MobileNavLinkProps {
  href: string
  label: string
  onClick: () => void
  badge?: string
}

const MobileNavLink = ({ href, label, onClick, badge }: MobileNavLinkProps) => {
  const pathname = usePathname()
  const isActive = pathname === href

  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors",
        isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span>{label}</span>
      {badge && (
        <Badge variant="outline" className="ml-2 text-xs">
          {badge}
        </Badge>
      )}
    </Link>
  )
}
