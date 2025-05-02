"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Store,
  IceCream,
  Users,
  Award,
  Settings,
  Heart,
  Bell,
  Menu,
  X,
  BarChart,
  Megaphone,
  Trophy,
  Search,
  User,
  LogOut,
  ChevronDown,
  PlusCircle,
  MapPin,
  BookOpen,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  requiresShop?: boolean
  badge?: string | number
}

interface NavGroup {
  title: string
  items: NavItem[]
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hasShop, setHasShop] = useState(false)
  const [shopManagementOpen, setShopManagementOpen] = useState(true)
  const { user, signOut } = useAuth()
  const supabase = createClient()

  useEffect(() => {
    async function checkShop() {
      if (!user) return

      try {
        const { data, error } = await supabase.from("shops").select("id").eq("owner_id", user.id).single()
        setHasShop(!!data && !error)
      } catch (error) {
        console.error("Error checking shop:", error)
      }
    }

    checkShop()
  }, [user, supabase])

  const navGroups: NavGroup[] = [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: "ConeDex",
          href: "/dashboard/conedex",
          icon: <IceCream className="h-5 w-5" />,
        },
        {
          title: "My ConeDex",
          href: "/dashboard/my-conedex",
          icon: <BookOpen className="h-5 w-5" />,
          description: "View your personal ice cream collection",
        },
        {
          title: "My Flavors",
          href: "/dashboard/flavors",
          icon: <IceCream className="h-5 w-5" />,
        },
        {
          title: "Log Flavor",
          href: "/dashboard/log-flavor",
          icon: <PlusCircle className="h-5 w-5" />,
          badge: "New",
        },
      ],
    },
    {
      title: "Discover",
      items: [
        {
          title: "Find Shops",
          href: "/dashboard/shops",
          icon: <Store className="h-5 w-5" />,
        },
        {
          title: "Shop Map",
          href: "/dashboard/shops/map",
          icon: <MapPin className="h-5 w-5" />,
        },
        {
          title: "Following",
          href: "/dashboard/following",
          icon: <Heart className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          title: "Teams",
          href: "/dashboard/teams",
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: "Leaderboard",
          href: "/dashboard/leaderboard",
          icon: <Trophy className="h-5 w-5" />,
        },
        {
          title: "Badges",
          href: "/dashboard/badges",
          icon: <Award className="h-5 w-5" />,
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          title: "Profile",
          href: "/dashboard/profile",
          icon: <User className="h-5 w-5" />,
        },
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
          badge: 3,
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
        },
      ],
    },
  ]

  const shopNavItems: NavItem[] = [
    {
      title: "Shop Dashboard",
      href: "/dashboard/shop",
      icon: <Store className="h-5 w-5" />,
      requiresShop: true,
    },
    {
      title: "Shop Analytics",
      href: "/dashboard/shop/analytics",
      icon: <BarChart className="h-5 w-5" />,
      requiresShop: true,
    },
    {
      title: "Marketing",
      href: "/dashboard/shop/marketing",
      icon: <Megaphone className="h-5 w-5" />,
      requiresShop: true,
    },
    {
      title: "Shop Flavors",
      href: "/dashboard/shop/flavors",
      icon: <IceCream className="h-5 w-5" />,
      requiresShop: true,
    },
    {
      title: "Announcements",
      href: "/dashboard/shop/announcements",
      icon: <Bell className="h-5 w-5" />,
      requiresShop: true,
    },
    {
      title: "Shop Settings",
      href: "/dashboard/shop/settings",
      icon: <Settings className="h-5 w-5" />,
      requiresShop: true,
    },
  ]

  const filteredShopNavItems = shopNavItems.filter((item) => !item.requiresShop || hasShop)

  const NavItems = () => (
    <div className="flex flex-col space-y-6">
      <div className="px-3 py-2">
        <div className="relative mb-6">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search..."
            className="w-full rounded-md border border-input bg-background py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                    pathname === item.href
                      ? "bg-accent text-accent-foreground font-medium"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "rounded-md p-1",
                        pathname === item.href
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary",
                      )}
                    >
                      {item.icon}
                    </div>
                    {item.title}
                  </div>
                  {item.badge && (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      {hasShop && (
        <div className="px-3 py-2">
          <Collapsible open={shopManagementOpen} onOpenChange={setShopManagementOpen}>
            <CollapsibleTrigger asChild>
              <button className="flex w-full items-center justify-between rounded-md px-4 py-2 text-sm font-medium hover:bg-accent">
                <div className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  <span>Shop Management</span>
                </div>
                <ChevronDown className={cn("h-4 w-4 transition-transform", shopManagementOpen && "rotate-180")} />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-1 space-y-1">
              {filteredShopNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-4 py-2 pl-9 text-sm transition-all hover:bg-accent",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "text-muted-foreground",
                  )}
                >
                  {item.icon}
                  {item.title}
                </Link>
              ))}
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}

      <div className="mt-auto px-3 py-2">
        <Button
          variant="outline"
          className="w-full justify-start gap-3"
          onClick={() => {
            signOut?.()
            window.location.href = "/"
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:border-r">
        <div className="flex h-full flex-col overflow-y-auto bg-card py-4">
          <div className="flex items-center px-4 py-2 mb-6">
            <Link href="/" className="flex items-center gap-2">
              <div className="rounded-full bg-primary p-1">
                <IceCream className="h-6 w-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">ConeDex</span>
            </Link>
          </div>
          <NavItems />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="h-10 w-10">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
            <div className="flex h-full flex-col overflow-y-auto">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                  <div className="rounded-full bg-primary p-1">
                    <IceCream className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-bold">ConeDex</span>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>
              <div className="flex-1 overflow-auto py-2">
                <NavItems />
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
