"use client"
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
  LogOut,
  User,
  Map,
  Compass,
  TrendingUp,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

interface MobileNavProps {
  isOpen: boolean
  onClose: () => void
  user?: any
}

export function MobileNav({ isOpen, onClose, user }: MobileNavProps) {
  const pathname = usePathname()
  const { signOut } = useAuth()
  const userRole = user?.role || "explorer"

  // Navigation items - updated to match sidebar
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
      label: "Shops",
      highlight: true,
    },
    {
      icon: <Map className="h-5 w-5" />,
      href: "/dashboard/shops/map",
      label: "Shops Map",
    },
    {
      icon: <Heart className="h-5 w-5" />,
      href: "/dashboard/following",
      label: "Following",
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
      label: "Notifications",
    },
    {
      icon: <User className="h-5 w-5" />,
      href: "/dashboard/profile",
      label: "Profile",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      href: "/dashboard/settings",
      label: "Settings",
    },
  ]

  // Admin-specific items
  if (userRole === "admin") {
    navItems.push({
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard/admin",
      label: "Admin",
    })
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
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-[250px] p-0 bg-purple-900 text-white">
        <div className="flex flex-col h-full">
          <div className="p-4 border-b border-purple-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-purple-700">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.username || "User"} />
                <AvatarFallback className="bg-orange-500 text-white">
                  {user?.username?.substring(0, 2).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user?.full_name || user?.username || "User"}</p>
                <p className="text-xs text-purple-300">{userRole}</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
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
                onClose()
              }}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-purple-300 hover:bg-purple-800 hover:text-white transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
