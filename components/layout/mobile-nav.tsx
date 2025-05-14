"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { Icons } from "@/components/ui/icons"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user?: any
}

export function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
  const pathname = usePathname()
  const [exploreSectionOpen, setExploreSectionOpen] = useState(true)
  const [accountSectionOpen, setAccountSectionOpen] = useState(false)
  const [adminSectionOpen, setAdminSectionOpen] = useState(false)
  const [shopSectionOpen, setShopSectionOpen] = useState(false)

  const userRole = user?.role || "explorer"
  const isExplorer = userRole === "explorer"
  const isShopOwner = userRole === "shop_owner"
  const isAdmin = userRole === "admin"

  // Get theme colors based on user role
  const getThemeColors = () => {
    if (isExplorer) {
      return {
        textColor: "text-strawberry-700",
        mutedTextColor: "text-strawberry-500",
        hoverBgColor: "hover:bg-strawberry-50",
        activeBgColor: "bg-strawberry-100",
        activeTextColor: "text-strawberry-700",
        iconColor: "text-strawberry-500",
        borderColor: "border-strawberry-100",
      }
    } else if (isShopOwner) {
      return {
        textColor: "text-mint-700",
        mutedTextColor: "text-mint-500",
        hoverBgColor: "hover:bg-mint-50",
        activeBgColor: "bg-mint-100",
        activeTextColor: "text-mint-700",
        iconColor: "text-mint-500",
        borderColor: "border-mint-100",
      }
    } else {
      return {
        textColor: "text-blueberry-700",
        mutedTextColor: "text-blueberry-500",
        hoverBgColor: "hover:bg-blueberry-50",
        activeBgColor: "bg-blueberry-100",
        activeTextColor: "text-blueberry-700",
        iconColor: "text-blueberry-500",
        borderColor: "border-blueberry-100",
      }
    }
  }

  const theme = getThemeColors()

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-full max-w-xs p-0">
        <div className="flex h-full flex-col overflow-y-auto">
          <div className={cn("flex items-center justify-between border-b px-4 py-3", theme.borderColor)}>
            <Link href="/" className="flex items-center gap-2" onClick={onClose}>
              <Icons.iceCream className={theme.iconColor} />
              <span className={cn("font-bold", theme.textColor)}>ConeDex</span>
            </Link>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className={theme.iconColor} />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-1 p-4">
            <nav className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  theme.hoverBgColor,
                  pathname === "/dashboard" ? cn(theme.activeBgColor, theme.activeTextColor) : theme.textColor,
                )}
              >
                <Icons.layoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>

              {/* Explore Section */}
              <Collapsible open={exploreSectionOpen} onOpenChange={setExploreSectionOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm font-medium",
                      theme.textColor,
                      theme.hoverBgColor,
                    )}
                  >
                    <div className="flex items-center">
                      <Icons.compass className="mr-2 h-4 w-4" />
                      Explore
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", exploreSectionOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-3 py-2">
                  <Link
                    href="/dashboard/conedex"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/conedex"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.iceCream className="mr-2 h-4 w-4" />
                    ConeDex
                  </Link>
                  <Link
                    href="/dashboard/my-conedex"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/my-conedex"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.bookOpen className="mr-2 h-4 w-4" />
                    My ConeDex
                  </Link>
                  <Link
                    href="/dashboard/shops"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/shops"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.store className="mr-2 h-4 w-4" />
                    Find Shops
                  </Link>
                  <Link
                    href="/dashboard/log-flavor"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/log-flavor"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.plusCircle className="mr-2 h-4 w-4" />
                    Log Flavor
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Community Section */}
              <Link
                href="/dashboard/leaderboard"
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  theme.hoverBgColor,
                  pathname === "/dashboard/leaderboard"
                    ? cn(theme.activeBgColor, theme.activeTextColor)
                    : theme.textColor,
                )}
              >
                <Icons.trophy className="mr-2 h-4 w-4" />
                Leaderboard
              </Link>
              <Link
                href="/dashboard/teams"
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  theme.hoverBgColor,
                  pathname === "/dashboard/teams" ? cn(theme.activeBgColor, theme.activeTextColor) : theme.textColor,
                )}
              >
                <Icons.users className="mr-2 h-4 w-4" />
                Teams
              </Link>
              <Link
                href="/dashboard/badges"
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                  theme.hoverBgColor,
                  pathname === "/dashboard/badges" ? cn(theme.activeBgColor, theme.activeTextColor) : theme.textColor,
                )}
              >
                <Icons.award className="mr-2 h-4 w-4" />
                Badges
              </Link>

              {/* Account Section */}
              <Collapsible open={accountSectionOpen} onOpenChange={setAccountSectionOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-sm font-medium",
                      theme.textColor,
                      theme.hoverBgColor,
                    )}
                  >
                    <div className="flex items-center">
                      <Icons.user className="mr-2 h-4 w-4" />
                      Account
                    </div>
                    <ChevronDown className={cn("h-4 w-4 transition-transform", accountSectionOpen && "rotate-180")} />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-1 px-3 py-2">
                  <Link
                    href="/dashboard/profile"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/profile"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.user className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/dashboard/notifications"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/notifications"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.bell className="mr-2 h-4 w-4" />
                    Notifications
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={onClose}
                    className={cn(
                      "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                      theme.hoverBgColor,
                      pathname === "/dashboard/settings"
                        ? cn(theme.activeBgColor, theme.activeTextColor)
                        : theme.textColor,
                    )}
                  >
                    <Icons.settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </CollapsibleContent>
              </Collapsible>

              {/* Shop Owner Section */}
              {isShopOwner && (
                <Collapsible open={shopSectionOpen} onOpenChange={setShopSectionOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm font-medium",
                        theme.textColor,
                        theme.hoverBgColor,
                      )}
                    >
                      <div className="flex items-center">
                        <Icons.store className="mr-2 h-4 w-4" />
                        My Shop
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", shopSectionOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 px-3 py-2">
                    <Link
                      href="/dashboard/shop"
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                        theme.hoverBgColor,
                        pathname === "/dashboard/shop"
                          ? cn(theme.activeBgColor, theme.activeTextColor)
                          : theme.textColor,
                      )}
                    >
                      <Icons.layoutDashboard className="mr-2 h-4 w-4" />
                      Shop Dashboard
                    </Link>
                    <Link
                      href="/dashboard/shop/flavors"
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                        theme.hoverBgColor,
                        pathname === "/dashboard/shop/flavors"
                          ? cn(theme.activeBgColor, theme.activeTextColor)
                          : theme.textColor,
                      )}
                    >
                      <Icons.iceCream className="mr-2 h-4 w-4" />
                      Shop Flavors
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              )}

              {/* Admin Section */}
              {isAdmin && (
                <Collapsible open={adminSectionOpen} onOpenChange={setAdminSectionOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-sm font-medium",
                        theme.textColor,
                        theme.hoverBgColor,
                      )}
                    >
                      <div className="flex items-center">
                        <Icons.shield className="mr-2 h-4 w-4" />
                        Admin
                      </div>
                      <ChevronDown className={cn("h-4 w-4 transition-transform", adminSectionOpen && "rotate-180")} />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-1 px-3 py-2">
                    <Link
                      href="/dashboard/admin"
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                        theme.hoverBgColor,
                        pathname === "/dashboard/admin"
                          ? cn(theme.activeBgColor, theme.activeTextColor)
                          : theme.textColor,
                      )}
                    >
                      <Icons.layoutDashboard className="mr-2 h-4 w-4" />
                      Admin Dashboard
                    </Link>
                    <Link
                      href="/dashboard/admin/users"
                      onClick={onClose}
                      className={cn(
                        "flex items-center rounded-md px-3 py-2 text-sm transition-colors",
                        theme.hoverBgColor,
                        pathname === "/dashboard/admin/users"
                          ? cn(theme.activeBgColor, theme.activeTextColor)
                          : theme.textColor,
                      )}
                    >
                      <Icons.users className="mr-2 h-4 w-4" />
                      Users
                    </Link>
                  </CollapsibleContent>
                </Collapsible>
              )}
            </nav>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
