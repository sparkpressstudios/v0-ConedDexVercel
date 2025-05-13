"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bell, User, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export function AdminHeader() {
  const [notifications, setNotifications] = useState(3)
  const pathname = usePathname()

  // Extract the current page title from the pathname
  const getPageTitle = () => {
    const path = pathname.split("/").filter(Boolean)
    if (path.length <= 2) return "Admin Dashboard"

    // Handle special cases
    if (path[2] === "users" && path.length > 3) {
      return "User Details"
    }
    if (path[2] === "shops") {
      if (path.length === 3) return "Shops Management"
      if (path[3] === "import") return "Import Shops"
      if (path[3] === "create") return "Create Shop"
      if (path.length > 3 && path[4] === "edit") return "Edit Shop"
      if (path.length > 3) return "Shop Details"
    }

    // Default cases
    return path[2].charAt(0).toUpperCase() + path[2].slice(1)
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <h1 className="text-xl font-semibold md:text-2xl">{getPageTitle()}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notifications > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 flex items-center justify-center">
              {notifications}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder.svg?key=5f9q1" alt="Admin" />
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Admin Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
