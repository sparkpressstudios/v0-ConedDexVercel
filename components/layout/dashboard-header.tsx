"use client"
import { Bell, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/contexts/auth-context"

interface DashboardHeaderProps {
  user?: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const { signOut } = useAuth()
  const userRole = user?.role || "explorer"
  const userName = user?.full_name || user?.username || "User"

  return (
    <header className="bg-white border-b border-gray-100 px-4 py-3 md:py-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="hidden md:block">
            <h1 className="text-2xl font-bold text-gray-900">Hello, {userName.split(" ")[0]}!</h1>
            <p className="text-sm text-gray-500">Welcome back to ConeDex</p>
          </div>
          <div className="md:hidden">
            <h1 className="text-xl font-bold text-gray-900">Hello, {userName.split(" ")[0]}!</h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Settings className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Avatar className="h-9 w-9 border border-gray-200">
            <AvatarImage src={user?.avatar_url || "/placeholder.svg"} alt={userName} />
            <AvatarFallback className="bg-orange-500 text-white">
              {userName.substring(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}
