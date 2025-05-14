"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, Search, User, LogOut, Settings, Store, IceCream, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { useAuth } from "@/contexts/auth-context"
import { MobileNav } from "@/components/layout/mobile-nav"
import { cn } from "@/lib/utils"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const userRole = user?.role || "explorer"
  const isAdmin = userRole === "admin"
  const isShopOwner = userRole === "shop_owner"
  const isExplorer = userRole === "explorer"

  // Get theme colors based on user role
  const getThemeColors = () => {
    if (isExplorer) {
      return {
        logoColor: "text-strawberry-500",
        bgAccent: "bg-strawberry-50",
        buttonHover: "hover:bg-strawberry-100",
        activeLink: "text-strawberry-600 font-medium",
        inactiveLink: "text-strawberry-400 hover:text-strawberry-500",
      }
    } else if (isShopOwner) {
      return {
        logoColor: "text-mint-500",
        bgAccent: "bg-mint-50",
        buttonHover: "hover:bg-mint-100",
        activeLink: "text-mint-600 font-medium",
        inactiveLink: "text-mint-400 hover:text-mint-500",
      }
    } else {
      return {
        logoColor: "text-blueberry-500",
        bgAccent: "bg-blueberry-50",
        buttonHover: "hover:bg-blueberry-100",
        activeLink: "text-blueberry-600 font-medium",
        inactiveLink: "text-blueberry-400 hover:text-blueberry-500",
      }
    }
  }

  const theme = getThemeColors()

  return (
    <header className={cn("sticky top-0 z-40 border-b bg-background", isExplorer && "bg-white")}>
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button
            variant="outline"
            size="icon"
            className={cn("md:hidden", isExplorer && "border-strawberry-200 text-strawberry-500")}
            onClick={() => setShowMobileMenu(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <IceCream className={cn("h-6 w-6", theme.logoColor)} />
            <span className={cn("hidden font-bold sm:inline-block", isExplorer && "text-strawberry-700")}>ConeDex</span>
          </Link>
          <div className="hidden md:flex">
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className={cn("transition-colors", pathname === "/dashboard" ? theme.activeLink : theme.inactiveLink)}
              >
                Dashboard
              </Link>

              {/* Explorer Links */}
              <Link
                href="/dashboard/conedex"
                className={cn(
                  "transition-colors",
                  pathname === "/dashboard/conedex" ? theme.activeLink : theme.inactiveLink,
                )}
              >
                ConeDex
              </Link>

              <Link
                href="/dashboard/shops"
                className={cn(
                  "transition-colors",
                  pathname === "/dashboard/shops" ? theme.activeLink : theme.inactiveLink,
                )}
              >
                Find Shops
              </Link>

              {/* Shop Owner Links */}
              {isShopOwner && (
                <Link
                  href="/dashboard/shop"
                  className={cn(
                    "transition-colors",
                    pathname.startsWith("/dashboard/shop") ? theme.activeLink : theme.inactiveLink,
                  )}
                >
                  My Shop
                </Link>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className={cn(
                    "transition-colors",
                    pathname.startsWith("/dashboard/admin") ? theme.activeLink : theme.inactiveLink,
                  )}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("relative hidden md:flex", isExplorer && theme.bgAccent, "rounded-md")}>
            <Search
              className={cn(
                "absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground",
                isExplorer && "text-strawberry-400",
              )}
            />
            <input
              type="search"
              placeholder="Search..."
              className={cn(
                "rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[200px] lg:w-[300px]",
                isExplorer &&
                  "bg-transparent border-transparent focus-visible:ring-strawberry-300 placeholder:text-strawberry-400",
              )}
            />
          </div>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn("relative h-8 w-8 rounded-full", isExplorer && theme.buttonHover)}>
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username || "User"} />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className={cn("w-56", isExplorer && "border-strawberry-100")} align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className={cn("text-sm font-medium leading-none", isExplorer && "text-strawberry-700")}>
                    {user?.full_name || user?.username}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className={isExplorer ? "text-strawberry-600" : ""}>
                    <User className={cn("mr-2 h-4 w-4", isExplorer && "text-strawberry-500")} />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                {isShopOwner && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/shop" className={isShopOwner ? "text-mint-600" : ""}>
                      <Store className={cn("mr-2 h-4 w-4", isShopOwner && "text-mint-500")} />
                      <span>My Shop</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin" className={isAdmin ? "text-blueberry-600" : ""}>
                      <Shield className={cn("mr-2 h-4 w-4", isAdmin && "text-blueberry-500")} />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link
                    href="/dashboard/settings"
                    className={cn(
                      isExplorer && "text-strawberry-600",
                      isShopOwner && "text-mint-600",
                      isAdmin && "text-blueberry-600",
                    )}
                  >
                    <Settings
                      className={cn(
                        "mr-2 h-4 w-4",
                        isExplorer && "text-strawberry-500",
                        isShopOwner && "text-mint-500",
                        isAdmin && "text-blueberry-500",
                      )}
                    />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut?.()}
                className={cn(
                  "cursor-pointer",
                  isExplorer && "text-strawberry-600",
                  isShopOwner && "text-mint-600",
                  isAdmin && "text-blueberry-600",
                )}
              >
                <LogOut
                  className={cn(
                    "mr-2 h-4 w-4",
                    isExplorer && "text-strawberry-500",
                    isShopOwner && "text-mint-500",
                    isAdmin && "text-blueberry-500",
                  )}
                />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <MobileNav isOpen={showMobileMenu} onClose={() => setShowMobileMenu(false)} user={user} />
    </header>
  )
}
