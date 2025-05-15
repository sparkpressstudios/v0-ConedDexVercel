"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  Lock,
  Bell,
  Compass,
  TrendingUp,
  Map,
  Search,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { createClient } from "@/lib/supabase/client"
import { useAuth } from "@/contexts/auth-context"

export function DashboardSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const supabase = createClient()
  const userRole = user?.role || "explorer"

  // Navigation items - restored all original items
  const navItems = [
    {
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
      label: "Dashboard",
    },
    {
      icon: <IceCream className="h-5 w-5" />,
      href: "/dashboard/conedex",
      label: "ConeDex",
    },
    {
      icon: <IceCream className="h-5 w-5" />,
      href: "/dashboard/my-conedex",
      label: "My ConeDex",
    },
    {
      icon: <IceCream className="h-5 w-5" />,
      href: "/dashboard/flavors",
      label: "Flavors",
    },
    {
      icon: <Store className="h-5 w-5" />,
      href: "/dashboard/shops",
      label: "My Shops",
    },
    {
      icon: <Search className="h-5 w-5" />,
      href: "/shops",
      label: "Explore Shops",
      highlight: true,
    },
    {
      icon: <Map className="h-5 w-5" />,
      href: "/dashboard/shops/map",
      label: "Shops Map",
    },
    {
      icon: <Users className="h-5 w-5" />,
      href: "/dashboard/teams",
      label: "Teams",
    },
    {
      icon: <Award className="h-5 w-5" />,
      href: "/dashboard/badges",
      label: "Badges",
    },
    {
      icon: <Compass className="h-5 w-5" />,
      href: "/dashboard/quests",
      label: "Quests",
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      href: "/dashboard/leaderboard",
      label: "Leaderboard",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      href: "/dashboard/notifications",
      label: "Messages",
    },
    {
      icon: <Lock className="h-5 w-5" />,
      href: "/dashboard/settings",
      label: "Settings",
    },
  ]

  // Admin-specific items
  if (userRole === "admin") {
    navItems.push(
      {
        icon: <LayoutDashboard className="h-5 w-5" />,
        href: "/dashboard/admin",
        label: "Admin",
      },
      {
        icon: <BarChart className="h-5 w-5" />,
        href: "/dashboard/admin/analytics",
        label: "Analytics",
      },
    )
  }

  // Shop owner-specific items
  if (userRole === "shop_owner") {
    navItems.push({
      icon: <Store className="h-5 w-5" />,
      href: "/dashboard/shop",
      label: "My Shop",
    })
  }

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-20 bg-purple-900 text-white">
        <div className="flex flex-col h-full py-6">
          <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center justify-center">
              <div className="text-white font-bold text-xl">
                <span className="text-white">C</span>
                <span className="text-orange-500">|</span>
                <span className="text-white">Dex</span>
              </div>
            </Link>
          </div>

          <nav className="flex-1 space-y-4 px-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center p-2 rounded-lg transition-colors",
                  pathname === item.href
                    ? "bg-purple-800 text-white"
                    : item.highlight
                      ? "text-white bg-purple-700 hover:bg-purple-800"
                      : "text-purple-300 hover:bg-purple-800 hover:text-white",
                )}
              >
                {item.icon}
                <span className="text-xs mt-1">{item.label.split(" ")[0]}</span>
              </Link>
            ))}
          </nav>

          <div className="mt-auto px-2">
            <button
              onClick={() => {
                signOut?.()
                window.location.href = "/"
              }}
              className="flex flex-col items-center justify-center w-full p-2 rounded-lg text-purple-300 hover:bg-purple-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs mt-1">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-10 w-10 text-purple-900">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[250px] p-0 bg-purple-900 text-white">
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-4 border-b border-purple-800">
                <Link href="/" className="flex items-center" onClick={() => setOpen(false)}>
                  <div className="text-white font-bold text-xl">
                    <span className="text-white">C</span>
                    <span className="text-orange-500">|</span>
                    <span className="text-white">Dex</span>
                  </div>
                </Link>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(false)}
                  className="text-white hover:bg-purple-800"
                >
                  <X className="h-5 w-5" />
                  <span className="sr-only">Close</span>
                </Button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors",
                      pathname === item.href
                        ? "bg-purple-800 text-white"
                        : item.highlight
                          ? "text-white bg-purple-700 hover:bg-purple-800"
                          : "text-purple-300 hover:bg-purple-800 hover:text-white",
                    )}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>

              <div className="p-4 border-t border-purple-800">
                <button
                  onClick={() => {
                    signOut?.()
                    window.location.href = "/"
                    setOpen(false)
                  }}
                  className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-purple-300 hover:bg-purple-800 hover:text-white transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
