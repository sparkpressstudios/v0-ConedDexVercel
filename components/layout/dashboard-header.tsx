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

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-2 md:gap-4">
          <Button variant="outline" size="icon" className="md:hidden" onClick={() => setShowMobileMenu(true)}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <Link href="/" className="hidden items-center space-x-2 md:flex">
            <IceCream className="h-6 w-6" />
            <span className="hidden font-bold sm:inline-block">ConeDex</span>
          </Link>
          <div className="hidden md:flex">
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/dashboard"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard" ? "text-foreground font-medium" : "text-foreground/60"
                }`}
              >
                Dashboard
              </Link>

              {/* Explorer Links */}
              <Link
                href="/dashboard/conedex"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard/conedex" ? "text-foreground font-medium" : "text-foreground/60"
                }`}
              >
                ConeDex
              </Link>

              <Link
                href="/dashboard/shops"
                className={`transition-colors hover:text-foreground/80 ${
                  pathname === "/dashboard/shops" ? "text-foreground font-medium" : "text-foreground/60"
                }`}
              >
                Find Shops
              </Link>

              {/* Shop Owner Links */}
              {isShopOwner && (
                <Link
                  href="/dashboard/shop"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname.startsWith("/dashboard/shop") ? "text-foreground font-medium" : "text-foreground/60"
                  }`}
                >
                  My Shop
                </Link>
              )}

              {/* Admin Links */}
              {isAdmin && (
                <Link
                  href="/dashboard/admin"
                  className={`transition-colors hover:text-foreground/80 ${
                    pathname.startsWith("/dashboard/admin") ? "text-foreground font-medium" : "text-foreground/60"
                  }`}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="rounded-md border border-input bg-background pl-8 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[200px] lg:w-[300px]"
            />
          </div>
          <NotificationBell />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username || "User"} />
                  <AvatarFallback>{user?.username?.substring(0, 2).toUpperCase() || "U"}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.full_name || user?.username}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>

                {isShopOwner && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/shop">
                      <Store className="mr-2 h-4 w-4" />
                      <span>My Shop</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/admin">
                      <Shield className="mr-2 h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                )}

                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut?.()} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
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
