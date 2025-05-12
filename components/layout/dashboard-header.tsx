"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { IceCream, Search, ChevronDown, User, Settings, LogOut } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client-browser"
import { DashboardSidebar } from "./dashboard-sidebar"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b bg-background/95 backdrop-blur px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <DashboardSidebar />
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <IceCream className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">ConeDex</span>
        </Link>
      </div>
      <div className="hidden md:flex md:items-center md:gap-2">
        <Link href="/" className="flex items-center gap-2">
          <div className="rounded-full bg-primary p-1">
            <IceCream className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">ConeDex</span>
        </Link>
      </div>
      <div className="ml-auto flex items-center gap-4">
        {/* Desktop Search */}
        <form className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shops or flavors..."
              className="w-64 rounded-full bg-background pl-8 md:w-80"
            />
          </div>
        </form>

        {/* Mobile Search Button */}
        <Sheet open={mobileSearchOpen} onOpenChange={setMobileSearchOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden">
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="h-auto">
            <div className="pt-4 pb-8">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search shops or flavors..."
                  className="w-full rounded-md pl-9"
                  autoFocus
                />
              </div>
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-medium">Recent Searches</h3>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    Chocolate
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    Sweet Dreams Ice Cream
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-accent">
                    Mint
                  </Badge>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Notification Bell */}
        <NotificationBell />

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={user?.full_name || user?.username} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(user?.full_name || user?.username || "User")}
                </AvatarFallback>
              </Avatar>
              <ChevronDown className="ml-2 h-4 w-4 text-muted-foreground" />
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
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="flex items-center">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="flex items-center">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
