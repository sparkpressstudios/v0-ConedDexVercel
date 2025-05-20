"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "@/components/providers/theme-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import {
  LayoutDashboard,
  Store,
  IceCream,
  Users,
  Award,
  Menu,
  X,
  BarChart,
  LogOut,
  Settings,
  Bell,
  TrendingUp,
  Map,
  Heart,
  Search,
  PlusCircle,
  Sparkles,
  BookOpen,
  ChevronRight,
} from "lucide-react"

// Navigation item type
type NavItem = {
  icon: React.ReactNode
  href: string
  label: string
  description?: string
  highlight?: boolean
  badge?: string | number
  children?: NavItem[]
}

// Navigation group type
type NavGroup = {
  title: string
  items: NavItem[]
}

export function ImprovedDashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const { userRoleTheme } = useTheme()
  const [activeGroups, setActiveGroups] = useState<Record<string, boolean>>({})
  const [isMobile, setIsMobile] = useState(false)

  // Check if we're on mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Define navigation groups based on user role
  const explorerNavGroups: NavGroup[] = [
    {
      title: "Discover",
      items: [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          label: "Dashboard",
        },
        {
          icon: <Search className="h-5 w-5" />,
          href: "/dashboard/explore-shops",
          label: "Explore Shops",
          highlight: true,
        },
        {
          icon: <Map className="h-5 w-5" />,
          href: "/dashboard/shops/map",
          label: "Shops Map",
        },
        {
          icon: <IceCream className="h-5 w-5" />,
          href: "/dashboard/conedex",
          label: "ConeDex",
        },
      ],
    },
    {
      title: "Personal",
      items: [
        {
          icon: <IceCream className="h-5 w-5" />,
          href: "/dashboard/my-conedex",
          label: "My ConeDex",
        },
        {
          icon: <PlusCircle className="h-5 w-5" />,
          href: "/dashboard/log-flavor",
          label: "Log Flavor",
        },
        {
          icon: <Heart className="h-5 w-5" />,
          href: "/dashboard/following",
          label: "Following",
        },
      ],
    },
    {
      title: "Community",
      items: [
        {
          icon: <Sparkles className="h-5 w-5" />,
          href: "/dashboard/quests",
          label: "Quests",
        },
        {
          icon: <Award className="h-5 w-5" />,
          href: "/dashboard/badges",
          label: "Badges",
        },
        {
          icon: <TrendingUp className="h-5 w-5" />,
          href: "/dashboard/leaderboard",
          label: "Leaderboard",
        },
        {
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/teams",
          label: "Teams",
        },
      ],
    },
    {
      title: "Account",
      items: [
        {
          icon: <Bell className="h-5 w-5" />,
          href: "/dashboard/notifications",
          label: "Notifications",
          badge: 3,
        },
        {
          icon: <Settings className="h-5 w-5" />,
          href: "/dashboard/settings",
          label: "Settings",
        },
      ],
    },
  ]

  const shopOwnerNavGroups: NavGroup[] = [
    {
      title: "Shop Management",
      items: [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard",
          label: "Dashboard",
        },
        {
          icon: <Store className="h-5 w-5" />,
          href: "/dashboard/shop",
          label: "My Shop",
          highlight: true,
        },
        {
          icon: <IceCream className="h-5 w-5" />,
          href: "/dashboard/shop/flavors",
          label: "Flavors",
          children: [
            {
              icon: <BookOpen className="h-4 w-4" />,
              href: "/dashboard/shop/flavors",
              label: "All Flavors",
            },
            {
              icon: <PlusCircle className="h-4 w-4" />,
              href: "/dashboard/shop/flavors/add",
              label: "Add Flavor",
            },
            {
              icon: <BookOpen className="h-4 w-4" />,
              href: "/dashboard/shop/flavors/catalog",
              label: "Catalog",
            },
          ],
        },
        {
          icon: <BarChart className="h-5 w-5" />,
          href: "/dashboard/shop/analytics",
          label: "Analytics",
        },
        {
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/shop/customers",
          label: "Customers",
        },
      ],
    },
    {
      title: "Marketing",
      items: [
        {
          icon: <Bell className="h-5 w-5" />,
          href: "/dashboard/shop/announcements",
          label: "Announcements",
        },
        {
          icon: <Award className="h-5 w-5" />,
          href: "/dashboard/shop/marketing",
          label: "Marketing",
        },
        {
          icon: <Store className="h-5 w-5" />,
          href: "/dashboard/shop/subscription",
          label: "Subscription",
        },
      ],
    },
    {
      title: "Explorer View",
      items: explorerNavGroups
        .flatMap((group) => group.items)
        .filter((item) => !["/dashboard/settings", "/dashboard/notifications"].includes(item.href)),
    },
  ]

  const adminNavGroups: NavGroup[] = [
    {
      title: "Admin",
      items: [
        {
          icon: <LayoutDashboard className="h-5 w-5" />,
          href: "/dashboard/admin",
          label: "Admin Dashboard",
          highlight: true,
        },
        {
          icon: <Users className="h-5 w-5" />,
          href: "/dashboard/admin/users",
          label: "Users",
        },
        {
          icon: <Store className="h-5 w-5" />,
          href: "/dashboard/admin/shops",
          label: "Shops",
        },
        {
          icon: <Award className="h-5 w-5" />,
          href: "/dashboard/admin/badges",
          label: "Badges",
        },
        {
          icon: <BarChart className="h-5 w-5" />,
          href: "/dashboard/admin/analytics",
          label: "Analytics",
        },
        {
          icon: <Bell className="h-5 w-5" />,
          href: "/dashboard/admin/newsletters",
          label: "Newsletters",
        },
      ],
    },
    {
      title: "Explorer View",
      items: explorerNavGroups.flatMap((group) => group.items),
    },
  ]

  // Select the appropriate navigation based on user role
  const navGroups =
    userRoleTheme === "shop-owner" ? shopOwnerNavGroups : userRoleTheme === "admin" ? adminNavGroups : explorerNavGroups

  // Toggle a navigation group's expanded state
  const toggleGroup = (title: string) => {
    setActiveGroups((prev) => ({
      ...prev,
      [title]: !prev[title],
    }))
  }

  // Check if a path is active (exact match or starts with path for nested routes)
  const isActivePath = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname !== "/dashboard" && pathname.startsWith(path)
  }

  // Render a navigation item
  const renderNavItem = (item: NavItem, isCompact = false) => {
    const isActive = isActivePath(item.href)

    return (
      <li key={item.href}>
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "nav-item group relative",
                  isActive ? "nav-item-active" : "nav-item-inactive",
                  isCompact && "flex-col justify-center h-14 text-center",
                  item.highlight && !isActive && "text-primary-600 font-medium",
                )}
              >
                <span className={cn("flex items-center", isCompact && "justify-center")}>
                  {item.icon}
                  {!isCompact && <span className="ml-2">{item.label}</span>}
                </span>
                {isCompact && <span className="text-xs mt-1">{item.label.split(" ")[0]}</span>}

                {item.badge && (
                  <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-medium text-white">
                    {item.badge}
                  </span>
                )}
              </Link>
            </TooltipTrigger>
            {isCompact && (
              <TooltipContent side="right">
                <p>{item.label}</p>
                {item.description && <p className="text-xs text-muted-foreground">{item.description}</p>}
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>

        {/* Render children if expanded */}
        {item.children && activeGroups[item.label] && (
          <ul className="ml-6 mt-1 space-y-1 border-l border-neutral-200 pl-2">
            {item.children.map((child) => (
              <li key={child.href}>
                <Link
                  href={child.href}
                  onClick={() => setOpen(false)}
                  className={cn("nav-item text-sm", isActivePath(child.href) ? "nav-item-active" : "nav-item-inactive")}
                >
                  {child.icon}
                  <span className="ml-2">{child.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </li>
    )
  }

  return (
    <>
      {/* Desktop Sidebar - Compact */}
      <div className="hidden md:block w-20 bg-primary-900 text-white">
        <div className="flex flex-col h-full">
          <div className="flex justify-center py-6">
            <Link href="/" className="flex items-center justify-center">
              <div className="text-white font-bold text-xl">
                <span className="text-white">C</span>
                <span
                  className={cn(
                    userRoleTheme === "shop-owner"
                      ? "text-teal-400"
                      : userRoleTheme === "admin"
                        ? "text-blue-400"
                        : "text-orange-400",
                  )}
                >
                  |
                </span>
                <span className="text-white">Dex</span>
              </div>
            </Link>
          </div>

          <ScrollArea className="flex-1 py-2 px-2">
            <nav className="space-y-6">
              {navGroups.map((group) => (
                <div key={group.title} className="space-y-2">
                  {group.items.slice(0, 6).map((item) => renderNavItem(item, true))}
                </div>
              ))}
            </nav>
          </ScrollArea>

          <div className="mt-auto p-2 border-t border-primary-800">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => {
                      signOut?.()
                      window.location.href = "/"
                    }}
                    className="w-full flex flex-col items-center justify-center p-2 rounded-lg text-primary-300 hover:bg-primary-800 hover:text-white transition-colors"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="text-xs mt-1">Logout</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-primary-900 mobile-touch-target">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] p-0 bg-primary-900 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-primary-800">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <div className="text-white font-bold text-xl">
                    <span className="text-white">Cone</span>
                    <span
                      className={cn(
                        userRoleTheme === "shop-owner"
                          ? "text-teal-400"
                          : userRoleTheme === "admin"
                            ? "text-blue-400"
                            : "text-orange-400",
                      )}
                    >
                      Dex
                    </span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="text-white hover:bg-primary-800 mobile-touch-target"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <ScrollArea className="flex-1">
                <nav className="p-4">
                  {navGroups.map((group) => (
                    <div key={group.title} className="mb-6">
                      <h3 className="text-xs font-semibold text-primary-300 uppercase tracking-wider mb-2 px-3">
                        {group.title}
                      </h3>
                      <ul className="space-y-1">
                        {group.items.map((item) => (
                          <li key={item.href}>
                            <div className="flex items-center">
                              <Link
                                href={item.href}
                                onClick={() => setOpen(false)}
                                className={cn(
                                  "flex-1 nav-item mobile-touch-target",
                                  isActivePath(item.href)
                                    ? "bg-primary-800 text-white"
                                    : "text-primary-100 hover:bg-primary-800 hover:text-white",
                                  item.highlight && !isActivePath(item.href) && "text-white bg-primary-700",
                                )}
                              >
                                {item.icon}
                                <span className="ml-2">{item.label}</span>

                                {item.badge && (
                                  <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary-500 text-[10px] font-medium text-white">
                                    {item.badge}
                                  </span>
                                )}
                              </Link>

                              {item.children && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-primary-300 hover:text-white"
                                  onClick={() => toggleGroup(item.label)}
                                >
                                  <ChevronRight
                                    className={cn(
                                      "h-4 w-4 transition-transform",
                                      activeGroups[item.label] && "rotate-90",
                                    )}
                                  />
                                </Button>
                              )}
                            </div>

                            {/* Render children if expanded */}
                            {item.children && activeGroups[item.label] && (
                              <ul className="mt-1 ml-6 space-y-1 border-l border-primary-800 pl-2">
                                {item.children.map((child) => (
                                  <li key={child.href}>
                                    <Link
                                      href={child.href}
                                      onClick={() => setOpen(false)}
                                      className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors mobile-touch-target",
                                        isActivePath(child.href)
                                          ? "bg-primary-800 text-white"
                                          : "text-primary-200 hover:bg-primary-800 hover:text-white",
                                      )}
                                    >
                                      {child.icon}
                                      <span>{child.label}</span>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </nav>
              </ScrollArea>

              <div className="p-4 border-t border-primary-800">
                <button
                  onClick={() => {
                    signOut?.()
                    window.location.href = "/"
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-primary-300 hover:bg-primary-800 hover:text-white transition-colors mobile-touch-target"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Log out</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
