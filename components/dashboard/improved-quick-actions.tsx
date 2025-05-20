"use client"

import { useState } from "react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogFlavorModal } from "@/components/flavor/log-flavor-modal"
import { Icons } from "@/components/ui/icons"

interface ImprovedQuickActionsProps {
  userRole?: string
}

export function ImprovedQuickActions({ userRole = "explorer" }: ImprovedQuickActionsProps) {
  const [isLogFlavorOpen, setIsLogFlavorOpen] = useState(false)

  // Explorer quick actions
  const explorerActions = [
    {
      icon: <Icons.iceCream className="h-5 w-5" />,
      label: "Log Flavor",
      description: "Record a new ice cream flavor you've tried",
      onClick: () => setIsLogFlavorOpen(true),
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      icon: <Icons.mapPin className="h-5 w-5" />,
      label: "Find Shops",
      description: "Discover ice cream shops near you",
      href: "/dashboard/explore-shops",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      icon: <Icons.compass className="h-5 w-5" />,
      label: "Quests",
      description: "Complete quests to earn badges",
      href: "/dashboard/quests",
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
    },
    {
      icon: <Icons.trophy className="h-5 w-5" />,
      label: "Leaderboard",
      description: "See how you rank against others",
      href: "/dashboard/leaderboard",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
  ]

  // Shop owner quick actions
  const shopOwnerActions = [
    {
      icon: <Icons.store className="h-5 w-5" />,
      label: "Shop Dashboard",
      description: "Manage your ice cream shop",
      href: "/dashboard/shop",
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
    },
    {
      icon: <Icons.iceCream className="h-5 w-5" />,
      label: "Add Flavor",
      description: "Add a new flavor to your shop",
      href: "/dashboard/shop/flavors/add",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      icon: <Icons.barChart className="h-5 w-5" />,
      label: "Analytics",
      description: "View your shop's performance",
      href: "/dashboard/shop/analytics",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      icon: <Icons.megaphone className="h-5 w-5" />,
      label: "Announcements",
      description: "Create a new announcement",
      href: "/dashboard/shop/announcements/new",
      color: "bg-gradient-to-br from-coral-400 to-coral-600",
    },
  ]

  // Admin quick actions
  const adminActions = [
    {
      icon: <Icons.shield className="h-5 w-5" />,
      label: "Admin Panel",
      description: "Access the admin dashboard",
      href: "/dashboard/admin",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      icon: <Icons.users className="h-5 w-5" />,
      label: "Manage Users",
      description: "View and manage users",
      href: "/dashboard/admin/users",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      icon: <Icons.store className="h-5 w-5" />,
      label: "Manage Shops",
      description: "View and manage shops",
      href: "/dashboard/admin/shops",
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
    },
    {
      icon: <Icons.barChart className="h-5 w-5" />,
      label: "Analytics",
      description: "View platform analytics",
      href: "/dashboard/admin/analytics",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
  ]

  // Select the appropriate actions based on user role
  const actions = userRole === "shop_owner" ? shopOwnerActions : userRole === "admin" ? adminActions : explorerActions

  return (
    <>
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {actions.map((action) =>
              action.href ? (
                <Link
                  key={action.label}
                  href={action.href}
                  className="group flex flex-col items-center text-center p-4 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <div
                    className={cn(
                      "p-3 rounded-full text-white mb-3 group-hover:scale-110 transition-transform",
                      action.color,
                    )}
                  >
                    {action.icon}
                  </div>
                  <h3 className="font-medium mb-1">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </Link>
              ) : (
                <Button
                  key={action.label}
                  variant="ghost"
                  className="group flex flex-col items-center text-center h-auto p-4 rounded-lg hover:bg-neutral-50"
                  onClick={action.onClick}
                >
                  <div
                    className={cn(
                      "p-3 rounded-full text-white mb-3 group-hover:scale-110 transition-transform",
                      action.color,
                    )}
                  >
                    {action.icon}
                  </div>
                  <h3 className="font-medium mb-1">{action.label}</h3>
                  <p className="text-xs text-muted-foreground">{action.description}</p>
                </Button>
              ),
            )}
          </div>
        </CardContent>
      </Card>

      {/* Log Flavor Modal */}
      <LogFlavorModal isOpen={isLogFlavorOpen} onClose={() => setIsLogFlavorOpen(false)} />
    </>
  )
}
