"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  X,
  LayoutDashboard,
  IceCream,
  Store,
  Users,
  Award,
  Settings,
  Heart,
  Bell,
  Search,
  User,
  LogOut,
  ChevronDown,
  Shield,
  BarChart,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/auth-context"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user?: any
}

export function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const [shopManagementOpen, setShopManagementOpen] = useState(false)
  const [adminManagementOpen, setAdminManagementOpen] = useState(false)

  const userRole = user?.role || "explorer"
  const isAdmin = userRole === "admin"
  const isShopOwner = userRole === "shop_owner"

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="pr-0 sm:max-w-xs">
        <div className="flex items-center justify-between pr-4">
          <Link href="/" className="flex items-center" onClick={onClose}>
            <IceCream className="mr-2 h-5 w-5" />
            <span className="font-bold">ConeDex</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
        <ScrollArea className="my-4 h-[calc(100vh-8rem)] pb-10 pl-6">
          <div className="relative mt-4 mb-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="search"
              placeholder="Search..."
              className="w-full rounded-md border border-input bg-background py-2 pl-8 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col space-y-3">
            <Link
              href="/dashboard"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard" && "font-medium text-foreground",
              )}
            >
              <LayoutDashboard className="h-5 w-5" />
              Dashboard
            </Link>

            {/* Explorer Links - Available to all users */}
            <Link
              href="/dashboard/conedex"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/conedex" && "font-medium text-foreground",
              )}
            >
              <IceCream className="h-5 w-5" />
              ConeDex
            </Link>

            <Link
              href="/dashboard/shops"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/shops" && "font-medium text-foreground",
              )}
            >
              <Store className="h-5 w-5" />
              Find Shops
            </Link>

            <Link
              href="/dashboard/flavors"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/flavors" && "font-medium text-foreground",
              )}
            >
              <IceCream className="h-5 w-5" />
              My Flavors
            </Link>

            <Link
              href="/dashboard/following"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/following" && "font-medium text-foreground",
              )}
            >
              <Heart className="h-5 w-5" />
              Following
            </Link>

            <Link
              href="/dashboard/badges"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/badges" && "font-medium text-foreground",
              )}
            >
              <Award className="h-5 w-5" />
              Badges
            </Link>

            {/* Shop Owner Links */}
            {isShopOwner && (
              <Collapsible open={shopManagementOpen} onOpenChange={setShopManagementOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Store className="h-5 w-5" />
                    <span>Shop Management</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", shopManagementOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 pl-7">
                  <Link
                    href="/dashboard/shop"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/shop" && "font-medium text-foreground",
                    )}
                  >
                    <Store className="h-4 w-4" />
                    Shop Dashboard
                  </Link>
                  <Link
                    href="/dashboard/shop/flavors"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/shop/flavors" && "font-medium text-foreground",
                    )}
                  >
                    <IceCream className="h-4 w-4" />
                    Shop Flavors
                  </Link>
                  <Link
                    href="/dashboard/shop/analytics"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/shop/analytics" && "font-medium text-foreground",
                    )}
                  >
                    <BarChart className="h-4 w-4" />
                    Analytics
                  </Link>
                </CollapsibleContent>
              </Collapsible>
            )}

            {/* Admin Links */}
            {isAdmin && (
              <Collapsible open={adminManagementOpen} onOpenChange={setAdminManagementOpen}>
                <CollapsibleTrigger className="flex w-full items-center justify-between text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    <span>Admin</span>
                  </div>
                  <ChevronDown className={cn("h-4 w-4 transition-transform", adminManagementOpen && "rotate-180")} />
                </CollapsibleTrigger>
                <CollapsibleContent className="mt-2 space-y-2 pl-7">
                  <Link
                    href="/dashboard/admin"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/admin" && "font-medium text-foreground",
                    )}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Admin Dashboard
                  </Link>
                  <Link
                    href="/dashboard/admin/users"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/admin/users" && "font-medium text-foreground",
                    )}
                  >
                    <Users className="h-4 w-4" />
                    Users
                  </Link>
                  <Link
                    href="/dashboard/admin/shops"
                    onClick={onClose}
                    className={cn(
                      "flex items-center gap-2 text-muted-foreground",
                      pathname === "/dashboard/admin/shops" && "font-medium text-foreground",
                    )}
                  >
                    <Store className="h-4 w-4" />
                    Shops
                  </Link>
                </CollapsibleContent>
              </Collapsible>
            )}

            <Link
              href="/dashboard/profile"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/profile" && "font-medium text-foreground",
              )}
            >
              <User className="h-5 w-5" />
              Profile
            </Link>

            <Link
              href="/dashboard/notifications"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/notifications" && "font-medium text-foreground",
              )}
            >
              <Bell className="h-5 w-5" />
              Notifications
            </Link>

            <Link
              href="/dashboard/settings"
              onClick={onClose}
              className={cn(
                "flex items-center gap-2 text-muted-foreground",
                pathname === "/dashboard/settings" && "font-medium text-foreground",
              )}
            >
              <Settings className="h-5 w-5" />
              Settings
            </Link>

            <Button
              variant="ghost"
              className="justify-start px-2"
              onClick={() => {
                signOut?.()
                onClose()
              }}
            >
              <LogOut className="mr-2 h-5 w-5" />
              Log out
            </Button>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}
