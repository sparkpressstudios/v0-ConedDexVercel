"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { AdminSidebar } from "@/components/layout/admin-sidebar"
import { Bell, Menu, Settings, User, LogOut } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useState } from "react"

export function AdminHeader() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Get the current section from the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean)
    if (path.length <= 2) return "Admin Dashboard"

    // Convert path segments to title case
    const section = path[2]
    return section.charAt(0).toUpperCase() + section.slice(1).replace(/-/g, " ")
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-4">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon" className="h-10 w-10">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0">
              <AdminSidebar />
            </SheetContent>
          </Sheet>
          <Link href="/dashboard/admin" className="flex items-center gap-2">
            <span className="text-xl font-bold hidden md:block">ConeDex Admin</span>
            <span className="text-xl font-bold md:hidden">Admin</span>
          </Link>
          <div className="hidden md:block text-lg font-medium">{getPageTitle()}</div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/admin/notifications">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <User className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user?.profile?.full_name || "Admin User"}</span>
                  <span className="text-xs text-muted-foreground">{user?.email}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard">Switch to User Dashboard</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/admin/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Admin Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut?.()
                  window.location.href = "/"
                }}
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
