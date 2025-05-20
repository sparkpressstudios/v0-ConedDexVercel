"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/providers/theme-provider"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { PlusCircle, X } from "lucide-react"
import { Icons } from "@/components/ui/icons"

type BottomNavItem = {
  icon: React.ElementType
  href: string
  label: string
}

export function MobileBottomNav() {
  const pathname = usePathname()
  const { userRoleTheme } = useTheme()
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  // Handle scroll to hide/show the bottom nav
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false)
      } else {
        setIsVisible(true)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Define navigation items based on user role
  const explorerNavItems: BottomNavItem[] = [
    {
      icon: Icons.layoutDashboard,
      href: "/dashboard",
      label: "Home",
    },
    {
      icon: Icons.search,
      href: "/dashboard/explore-shops",
      label: "Explore",
    },
    {
      icon: Icons.iceCream,
      href: "/dashboard/my-conedex",
      label: "ConeDex",
    },
    {
      icon: Icons.mapPin,
      href: "/dashboard/shops/map",
      label: "Map",
    },
    {
      icon: Icons.user,
      href: "/dashboard/profile",
      label: "Profile",
    },
  ]

  const shopOwnerNavItems: BottomNavItem[] = [
    {
      icon: Icons.layoutDashboard,
      href: "/dashboard",
      label: "Home",
    },
    {
      icon: Icons.store,
      href: "/dashboard/shop",
      label: "My Shop",
    },
    {
      icon: Icons.iceCream,
      href: "/dashboard/shop/flavors",
      label: "Flavors",
    },
    {
      icon: Icons.barChart,
      href: "/dashboard/shop/analytics",
      label: "Analytics",
    },
    {
      icon: Icons.user,
      href: "/dashboard/profile",
      label: "Profile",
    },
  ]

  const adminNavItems: BottomNavItem[] = [
    {
      icon: Icons.layoutDashboard,
      href: "/dashboard",
      label: "Home",
    },
    {
      icon: Icons.shield,
      href: "/dashboard/admin",
      label: "Admin",
    },
    {
      icon: Icons.users,
      href: "/dashboard/admin/users",
      label: "Users",
    },
    {
      icon: Icons.store,
      href: "/dashboard/admin/shops",
      label: "Shops",
    },
    {
      icon: Icons.user,
      href: "/dashboard/profile",
      label: "Profile",
    },
  ]

  // Select the appropriate navigation based on user role
  const navItems =
    userRoleTheme === "shop-owner" ? shopOwnerNavItems : userRoleTheme === "admin" ? adminNavItems : explorerNavItems

  // Quick action items based on user role
  const explorerQuickActions = [
    {
      icon: <Icons.iceCream className="h-5 w-5" />,
      label: "Log Flavor",
      href: "/dashboard/log-flavor",
      color: "bg-orange-500",
    },
    {
      icon: <Icons.mapPin className="h-5 w-5" />,
      label: "Check In",
      href: "/dashboard/shops",
      color: "bg-purple-500",
    },
    {
      icon: <Icons.compass className="h-5 w-5" />,
      label: "Quests",
      href: "/dashboard/quests",
      color: "bg-teal-500",
    },
    {
      icon: <Icons.bell className="h-5 w-5" />,
      label: "Notifications",
      href: "/dashboard/notifications",
      color: "bg-blue-500",
    },
  ]

  const shopOwnerQuickActions = [
    {
      icon: <Icons.iceCream className="h-5 w-5" />,
      label: "Add Flavor",
      href: "/dashboard/shop/flavors/add",
      color: "bg-teal-500",
    },
    {
      icon: <Icons.megaphone className="h-5 w-5" />,
      label: "Announcement",
      href: "/dashboard/shop/announcements/new",
      color: "bg-coral-500",
    },
    {
      icon: <Icons.users className="h-5 w-5" />,
      label: "Customers",
      href: "/dashboard/shop/customers",
      color: "bg-blue-500",
    },
    {
      icon: <Icons.bell className="h-5 w-5" />,
      label: "Notifications",
      href: "/dashboard/notifications",
      color: "bg-purple-500",
    },
  ]

  const adminQuickActions = [
    {
      icon: <Icons.users className="h-5 w-5" />,
      label: "Add User",
      href: "/dashboard/admin/users",
      color: "bg-blue-500",
    },
    {
      icon: <Icons.store className="h-5 w-5" />,
      label: "Add Shop",
      href: "/dashboard/admin/shops/create",
      color: "bg-teal-500",
    },
    {
      icon: <Icons.megaphone className="h-5 w-5" />,
      label: "Newsletter",
      href: "/dashboard/admin/newsletters",
      color: "bg-purple-500",
    },
    {
      icon: <Icons.bell className="h-5 w-5" />,
      label: "Notifications",
      href: "/dashboard/notifications",
      color: "bg-coral-500",
    },
  ]

  // Select the appropriate quick actions based on user role
  const quickActions =
    userRoleTheme === "shop-owner"
      ? shopOwnerQuickActions
      : userRoleTheme === "admin"
        ? adminQuickActions
        : explorerQuickActions

  return (
    <>
      {/* Bottom Navigation */}
      <div
        className={cn(
          "md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 z-50 transition-transform duration-300",
          !isVisible && "translate-y-full",
        )}
      >
        <div className="flex items-center justify-around h-16">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`)

            // Center item is the quick action button
            if (index === Math.floor(navItems.length / 2)) {
              return (
                <Sheet key="quick-actions" open={isQuickActionsOpen} onOpenChange={setIsQuickActionsOpen}>
                  <SheetTrigger asChild>
                    <button
                      className={cn(
                        "flex flex-col items-center justify-center w-12 h-12 rounded-full -mt-6 shadow-lg mobile-touch-target",
                        userRoleTheme === "shop-owner"
                          ? "bg-teal-600"
                          : userRoleTheme === "admin"
                            ? "bg-blue-600"
                            : "bg-primary-600",
                      )}
                    >
                      <PlusCircle className="h-6 w-6 text-white" />
                      <span className="sr-only">Quick Actions</span>
                    </button>
                  </SheetTrigger>
                  <SheetContent side="bottom" className="h-[40vh] rounded-t-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-semibold">Quick Actions</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsQuickActionsOpen(false)}
                        className="mobile-touch-target"
                      >
                        <X className="h-5 w-5" />
                        <span className="sr-only">Close</span>
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {quickActions.map((action) => (
                        <Link
                          key={action.label}
                          href={action.href}
                          onClick={() => setIsQuickActionsOpen(false)}
                          className="flex flex-col items-center justify-center p-4 rounded-lg bg-neutral-50 hover:bg-neutral-100 transition-colors mobile-touch-target"
                        >
                          <div className={cn("p-3 rounded-full text-white mb-2", action.color)}>{action.icon}</div>
                          <span className="text-sm font-medium">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              )
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center w-full py-1 mobile-touch-target",
                  isActive
                    ? userRoleTheme === "shop-owner"
                      ? "text-teal-600"
                      : userRoleTheme === "admin"
                        ? "text-blue-600"
                        : "text-primary-600"
                    : "text-neutral-500",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </>
  )
}
