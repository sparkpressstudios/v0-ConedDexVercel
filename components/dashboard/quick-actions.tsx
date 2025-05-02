"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, MapPin, Store, Users, Award, ChevronUp, ChevronDown, IceCream, Search } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface QuickActionsProps {
  className?: string
}

export function QuickActions({ className }: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const actions = [
    {
      icon: <PlusCircle className="h-4 w-4" />,
      label: "Log Flavor",
      href: "/dashboard/log-flavor",
      color: "text-pink-500",
      bgColor: "bg-pink-100",
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Find Shops",
      href: "/dashboard/shops",
      color: "text-blue-500",
      bgColor: "bg-blue-100",
    },
    {
      icon: <Store className="h-4 w-4" />,
      label: "Shop Map",
      href: "/dashboard/shops/map",
      color: "text-indigo-500",
      bgColor: "bg-indigo-100",
    },
    {
      icon: <Users className="h-4 w-4" />,
      label: "Teams",
      href: "/dashboard/teams",
      color: "text-green-500",
      bgColor: "bg-green-100",
    },
    {
      icon: <Award className="h-4 w-4" />,
      label: "Badges",
      href: "/dashboard/badges",
      color: "text-amber-500",
      bgColor: "bg-amber-100",
    },
    {
      icon: <IceCream className="h-4 w-4" />,
      label: "ConeDex",
      href: "/dashboard/conedex",
      color: "text-purple-500",
      bgColor: "bg-purple-100",
    },
    {
      icon: <Search className="h-4 w-4" />,
      label: "Search",
      href: "#",
      color: "text-gray-500",
      bgColor: "bg-gray-100",
      onClick: () => document.querySelector('input[type="search"]')?.focus(),
    },
  ]

  return (
    <div className={cn("fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2", className)}>
      <div
        className={cn(
          "flex flex-col gap-2 transition-all duration-200 ease-in-out",
          isExpanded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none",
        )}
      >
        <TooltipProvider>
          {actions.map((action, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                {action.onClick ? (
                  <Button
                    size="icon"
                    variant="outline"
                    className={cn("rounded-full shadow-sm", action.bgColor)}
                    onClick={action.onClick}
                  >
                    <span className={action.color}>{action.icon}</span>
                    <span className="sr-only">{action.label}</span>
                  </Button>
                ) : (
                  <Button
                    size="icon"
                    variant="outline"
                    className={cn("rounded-full shadow-sm", action.bgColor)}
                    asChild
                  >
                    <Link href={action.href}>
                      <span className={action.color}>{action.icon}</span>
                      <span className="sr-only">{action.label}</span>
                    </Link>
                  </Button>
                )}
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>{action.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <Button
        size="icon"
        className="rounded-full shadow-md bg-primary hover:bg-primary/90"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {isExpanded ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
        <span className="sr-only">{isExpanded ? "Hide quick actions" : "Show quick actions"}</span>
      </Button>
    </div>
  )
}
