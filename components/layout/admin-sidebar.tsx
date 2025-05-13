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
  Mail,
  TestTube,
  UserCheck,
  CheckSquare,
  FileText,
  Map,
  PlusCircle,
  RefreshCw,
  Search,
} from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { useState } from "react"

export function AdminSidebar() {
  const pathname = usePathname()
  const [shopsOpen, setShopsOpen] = useState(true)
  const [analyticsOpen, setAnalyticsOpen] = useState(false)

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
  ]

  return (
    <div className="space-y-4 py-4 flex flex-col h-full bg-white dark:bg-gray-950">
      <div className="px-3 py-2">
        <h2 className="mb-2 px-4 text-lg font-semibold">Admin</h2>
        <div className="space-y-1">
          {/* Main routes */}
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

          {/* Shops Management Collapsible */}
          <Collapsible open={shopsOpen} onOpenChange={setShopsOpen} className="w-full">
            <CollapsibleTrigger className="text-sm group flex p-3 w-full justify-between items-center font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition text-gray-500">
              <div className="flex items-center">
                <Building className="h-5 w-5 mr-3 text-gray-500" />
                Shops
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("h-4 w-4 transition-transform", shopsOpen ? "rotate-180" : "")}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-10 space-y-1">
              <Link
                href="/dashboard/admin/shops"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/shops" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <Building className="h-4 w-4 mr-2 text-gray-500" />
                  All Shops
                </div>
              </Link>
              <Link
                href="/dashboard/admin/shops/claims"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/shops/claims" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <CheckSquare className="h-4 w-4 mr-2 text-gray-500" />
                  Shop Claims
                </div>
              </Link>
              <Link
                href="/dashboard/admin/shops/import"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/shops/import" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <PlusCircle className="h-4 w-4 mr-2 text-gray-500" />
                  Import Shops
                </div>
              </Link>
              <Link
                href="/dashboard/admin/shops/import/refresh"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/shops/import/refresh" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <RefreshCw className="h-4 w-4 mr-2 text-gray-500" />
                  Refresh Shops
                </div>
              </Link>
              <Link
                href="/dashboard/admin/shops/map"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/shops/map" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <Map className="h-4 w-4 mr-2 text-gray-500" />
                  Shops Map
                </div>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          {/* Other main routes */}
          <Link
            href="/dashboard/admin/badges"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/badges" || pathname?.startsWith("/dashboard/admin/badges/")
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <Award className="h-5 w-5 mr-3 text-gray-500" />
              Badges
            </div>
          </Link>

          <Link
            href="/dashboard/admin/moderation"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/moderation"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <Flag className="h-5 w-5 mr-3 text-gray-500" />
              Moderation
            </div>
          </Link>

          <Link
            href="/dashboard/admin/verification"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/verification"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <ShieldAlert className="h-5 w-5 mr-3 text-gray-500" />
              Verification
            </div>
          </Link>

          <Link
            href="/dashboard/admin/roles"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/roles" || pathname?.startsWith("/dashboard/admin/roles/")
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <UserCheck className="h-5 w-5 mr-3 text-gray-500" />
              Roles
            </div>
          </Link>

          <Link
            href="/dashboard/admin/subscriptions"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/subscriptions" && !pathname?.includes("/stripe-mapping")
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <CreditCard className="h-5 w-5 mr-3 text-gray-500" />
              Subscriptions
            </div>
          </Link>

          <Link
            href="/dashboard/admin/stripe-mapping"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/stripe-mapping"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <CreditCardIcon className="h-5 w-5 mr-3 text-gray-500" />
              Stripe Mapping
            </div>
          </Link>

          {/* Analytics Collapsible */}
          <Collapsible open={analyticsOpen} onOpenChange={setAnalyticsOpen} className="w-full">
            <CollapsibleTrigger className="text-sm group flex p-3 w-full justify-between items-center font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition text-gray-500">
              <div className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-3 text-gray-500" />
                Analytics
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={cn("h-4 w-4 transition-transform", analyticsOpen ? "rotate-180" : "")}
              >
                <polyline points="6 9 12 15 18 9"></polyline>
              </svg>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-10 space-y-1">
              <Link
                href="/dashboard/admin/analytics"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/analytics" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <BarChart3 className="h-4 w-4 mr-2 text-gray-500" />
                  Dashboard
                </div>
              </Link>
              <Link
                href="/dashboard/admin/analytics/exports"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/analytics/exports" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <FileText className="h-4 w-4 mr-2 text-gray-500" />
                  Exports
                </div>
              </Link>
              <Link
                href="/dashboard/admin/analytics/search"
                className={cn(
                  "text-sm flex p-2 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
                  pathname === "/dashboard/admin/analytics/search" ? "text-primary" : "text-gray-500",
                )}
              >
                <div className="flex items-center flex-1">
                  <Search className="h-4 w-4 mr-2 text-gray-500" />
                  Search Analytics
                </div>
              </Link>
            </CollapsibleContent>
          </Collapsible>

          <Link
            href="/dashboard/admin/newsletters"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/newsletters" || pathname?.startsWith("/dashboard/admin/newsletters/")
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <Mail className="h-5 w-5 mr-3 text-gray-500" />
              Newsletters
            </div>
          </Link>

          <Link
            href="/dashboard/admin/testing"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/testing"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <TestTube className="h-5 w-5 mr-3 text-gray-500" />
              Testing
            </div>
          </Link>

          <Link
            href="/dashboard/admin/audit-logs"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/audit-logs"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <History className="h-5 w-5 mr-3 text-gray-500" />
              Audit Logs
            </div>
          </Link>

          <Link
            href="/dashboard/admin/settings"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/settings"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <Settings className="h-5 w-5 mr-3 text-gray-500" />
              Settings
            </div>
          </Link>

          <Link
            href="/dashboard/admin/database"
            className={cn(
              "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-primary hover:bg-primary/10 rounded-lg transition",
              pathname === "/dashboard/admin/database"
                ? "text-white bg-primary hover:bg-primary hover:text-white"
                : "text-gray-500",
            )}
          >
            <div className="flex items-center flex-1">
              <Database className="h-5 w-5 mr-3 text-gray-500" />
              Database
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}
