"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Home, IceCream, Store, Award, Users, Heart, Bell, User, Settings, Menu, X } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  const routes = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
    },
    {
      name: "Flavors",
      href: "/dashboard/flavors",
      icon: IceCream,
    },
    {
      name: "Shops",
      href: "/dashboard/shops",
      icon: Store,
    },
    {
      name: "My ConeDex",
      href: "/dashboard/my-conedex",
      icon: IceCream,
    },
    {
      name: "Badges",
      href: "/dashboard/badges",
      icon: Award,
    },
    {
      name: "Teams",
      href: "/dashboard/teams",
      icon: Users,
    },
    {
      name: "Following",
      href: "/dashboard/following",
      icon: Heart,
    },
    {
      name: "Notifications",
      href: "/dashboard/notifications",
      icon: Bell,
    },
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: User,
    },
    {
      name: "Settings",
      href: "/dashboard/settings",
      icon: Settings,
    },
  ]

  const NavLinks = () => (
    <>
      {routes.map((route) => {
        const isActive = pathname === route.href
        return (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
              isActive ? "bg-primary/10 text-primary" : "text-muted-foreground",
            )}
            onClick={() => setOpen(false)}
          >
            <route.icon className="h-4 w-4" />
            {route.name}
          </Link>
        )
      })}
    </>
  )

  return (
    <>
      <div className="hidden md:flex h-screen w-64 flex-col border-r bg-background p-4">
        <div className="flex items-center gap-2 px-2 mb-4">
          <IceCream className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">ConeDex</span>
        </div>
        <nav className="flex-1 space-y-2">
          <NavLinks />
        </nav>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild className="md:hidden absolute top-4 left-4 z-50">
          <button className="p-2 rounded-md bg-background border">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-4">
          <div className="flex items-center gap-2 px-2 mb-4">
            <IceCream className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ConeDex</span>
          </div>
          <nav className="flex-1 space-y-2">
            <NavLinks />
          </nav>
        </SheetContent>
      </Sheet>
    </>
  )
}
