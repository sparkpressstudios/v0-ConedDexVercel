"use client"

import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { IceCream, BarChart, Users, Bell, Megaphone, Settings, ShoppingBag, Star } from "lucide-react"

interface ShopQuickActionsProps {
  shop: any
}

export function ShopQuickActions({ shop }: ShopQuickActionsProps) {
  if (!shop) return null

  const actions = [
    {
      icon: <IceCream className="h-5 w-5" />,
      label: "Add Flavor",
      description: "Add a new flavor to your shop",
      href: "/dashboard/shop/flavors/add",
      color: "bg-gradient-to-br from-orange-400 to-orange-600",
    },
    {
      icon: <BarChart className="h-5 w-5" />,
      label: "Analytics",
      description: "View your shop's performance",
      href: "/dashboard/shop/analytics",
      color: "bg-gradient-to-br from-blue-400 to-blue-600",
    },
    {
      icon: <Megaphone className="h-5 w-5" />,
      label: "Announcements",
      description: "Create a new announcement",
      href: "/dashboard/shop/announcements/new",
      color: "bg-gradient-to-br from-teal-400 to-teal-600",
    },
    {
      icon: <ShoppingBag className="h-5 w-5" />,
      label: "Menu",
      description: "Manage your shop's menu",
      href: "/dashboard/shop/menu",
      color: "bg-gradient-to-br from-purple-400 to-purple-600",
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Customers",
      description: "View and manage customers",
      href: "/dashboard/shop/customers",
      color: "bg-gradient-to-br from-coral-400 to-coral-600",
    },
    {
      icon: <Star className="h-5 w-5" />,
      label: "Reviews",
      description: "View and respond to reviews",
      href: "/dashboard/shop/reviews",
      color: "bg-gradient-to-br from-yellow-400 to-yellow-600",
    },
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      description: "Manage your notifications",
      href: "/dashboard/notifications",
      color: "bg-gradient-to-br from-indigo-400 to-indigo-600",
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      description: "Configure shop settings",
      href: "/dashboard/shop/settings",
      color: "bg-gradient-to-br from-neutral-400 to-neutral-600",
    },
  ]

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {actions.map((action) => (
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
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
