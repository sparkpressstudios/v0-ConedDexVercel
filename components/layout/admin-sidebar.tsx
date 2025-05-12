"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  BarChart3,
  Building,
  Database,
  Flag,
  Home,
  Settings,
  ShieldAlert,
  Users,
  Award,
  CreditCard,
  CreditCardIcon,
  History,
} from "lucide-react"

export function AdminSidebar() {
  const pathname = usePathname()

  const routes = [
    {
      label: "Dashboard",
      icon: Home,
      href: "/dashboard/admin",
      active: pathname === "/dashboard/admin",
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/admin/users",
      active: pathname === "/dashboard/admin/users" || pathname?.startsWith("/dashboard/admin/users/"),
    },
    {
      label: "Shops",
      icon: Building,
      href: "/dashboard/admin/shops",
      active: pathname === "/dashboard/admin/shops" || pathname?.startsWith("/dashboard/admin/shops/"),
    },
    {
      label: "Badges",
      icon: Award,
      href: "/dashboard/admin/badges",
      active: pathname === "/dashboard/admin/badges",
    },
    {
      label: "Moderation",
      icon: Flag,
      href: "/dashboard/admin/moderation",
      active: pathname === "/dashboard/admin/moderation",
    },
    {
      label: "Verification",
      icon: ShieldAlert,
      href: "/dashboard/admin/verification",
      active: pathname === "/dashboard/admin/verification",
    },
    {
      label: "Subscriptions",
      icon: CreditCard,
      href: "/dashboard/admin/subscriptions",
      active: pathname === "/dashboard/admin/subscriptions" && !pathname?.includes("/stripe-mapping"),
    },
    {
      label: "Stripe Mapping",
      icon: CreditCardIcon,
      href: "/dashboard/admin/stripe-mapping",
      active: pathname === "/dashboard/admin/stripe-mapping",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/dashboard/admin/analytics",
      active: pathname === "/dashboard/admin/analytics",
    },
    {
      label: "Audit Logs",
      icon: History,
      href: "/dashboard/admin/audit-logs",
      active: pathname === "/dashboard/admin/audit-logs",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/dashboard/admin/settings",
      active: pathname === "/dashboard/admin/settings",
    },
    {
      label: "Database",
      icon: Database,
      href: "/dashboard/admin/database",
      active: pathname === "/dashboard/admin/database",
    },
  ]

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin</h2>
        <div className="space-y-1">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                route.active ? "text-white bg-primary hover:bg-primary hover:text-white" : "text-gray-500",
              )}
            >
              <div className="flex items-center flex-1">
                <route.icon className={cn("h-5 w-5 mr-3", route.active ? "text-white" : "text-gray-500")} />
                {route.label}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
