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
  roles?: string[]
}

interface NavGroup {
  title: string
  items: NavItem[]
  roles?: string[]
}

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [hasShop, setHasShop] = useState(false)
  const [shopManagementOpen, setShopManagementOpen] = useState(true)
  const { user, signOut } = useAuth()
  const supabase = createClient()
  const userRole = user?.role || "explorer"

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

  // Explorer navigation items
  const explorerNavGroups: NavGroup[] = [
    {
      title: "General",
      items: [
        {
          title: "Dashboard",
          href: "/dashboard",
          icon: <LayoutDashboard className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "ConeDex",
          href: "/dashboard/conedex",
          icon: <IceCream className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "My ConeDex",
          href: "/dashboard/my-conedex",
          icon: <BookOpen className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "My Flavors",
          href: "/dashboard/flavors",
          icon: <IceCream className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Log Flavor",
          href: "/dashboard/log-flavor",
          icon: <PlusCircle className="h-5 w-5" />,
          badge: "New",
          roles: ["explorer", "shop_owner", "admin"],
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
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Following",
          href: "/dashboard/following",
          icon: <Heart className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
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
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Leaderboard",
          href: "/dashboard/leaderboard",
          icon: <Trophy className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Badges",
          href: "/dashboard/badges",
          icon: <Award className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
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
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: <Bell className="h-5 w-5" />,
          badge: 3,
          roles: ["explorer", "shop_owner", "admin"],
        },
        {
          title: "Settings",
          href: "/dashboard/settings",
          icon: <Settings className="h-5 w-5" />,
          roles: ["explorer", "shop_owner", "admin"],
        },
      ],
    },
  ]

  // Shop owner navigation items
  const shopNavItems: NavItem[] = [
    {
      title: "Shop Dashboard",
      href: "/dashboard/shop",
      icon: <Store className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
    {
      title: "Shop Analytics",
      href: "/dashboard/shop/analytics",
      icon: <BarChart className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
    {
      title: "Marketing",
      href: "/dashboard/shop/marketing",
      icon: <Megaphone className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
    {
      title: "Shop Flavors",
      href: "/dashboard/shop/flavors",
      icon: <IceCream className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
    {
      title: "Announcements",
      href: "/dashboard/shop/announcements",
      icon: <Bell className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
    {
      title: "Shop Settings",
      href: "/dashboard/shop/settings",
      icon: <Settings className="h-5 w-5" />,
      requiresShop: true,
      roles: ["shop_owner", "admin"],
    },
  ]

  // Admin navigation items
  const adminNavItems: NavItem[] = [
    {
      title: "Admin Dashboard",
      href: "/dashboard/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Users Management",
      href: "/dashboard/admin/users",
      icon: <Users className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Shops Management",
      href: "/dashboard/admin/shops",
      icon: <Store className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Shop Claims",
      href: "/dashboard/admin/shops/claims",
      icon: <Store className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Badges Management",
      href: "/dashboard/admin/badges",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Content Moderation",
      href: "/dashboard/admin/moderation",
      icon: <Bell className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Subscriptions",
      href: "/dashboard/admin/subscriptions",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Stripe Mapping",
      href: "/dashboard/admin/stripe-mapping",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: <BarChart className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Audit Logs",
      href: "/dashboard/admin/audit-logs",
      icon: <Award className="h-5 w-5" />,
      roles: ["admin"],
    },
    {
      title: "Admin Settings",
      href: "/dashboard/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      roles: ["admin"],
    },
  ]

  // Filter shop nav items based on shop ownership and role
  const filteredShopNavItems = shopNavItems.filter(
    (item) => (!item.requiresShop || hasShop) && item.roles?.includes(userRole),
  )

  // Create admin nav groups
  const adminNavGroups: NavGroup[] = [
    {
      title: "Administration",
      items: adminNavItems,
      roles: ["admin"],
    },
  ]

  // Combine nav groups based on user role
  const navGroups = [...explorerNavGroups, ...(userRole === "admin" ? adminNavGroups : [])]

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

        {navGroups.map((group) => {
          // Skip groups that don't apply to the user's role
          if (group.roles && !group.roles.includes(userRole)) {
            return null
          }

          return (
            <div key={group.title} className="mb-6">
              <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {group.title}
              </h2>
              <div className="space-y-1">
                {group.items.map((item) => {
                  // Skip items that don't apply to the user's role
                  if (item.roles && !item.roles.includes(userRole)) {
                    return null
                  }

                  return (
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
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Shop Management Section - Only for shop owners and admins */}
      {(userRole === "shop_owner" || userRole === "admin") && hasShop && filteredShopNavItems.length > 0 && (
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
