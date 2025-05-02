import { Icons } from "@/components/ui/icons"
import { cn } from "@/lib/utils"

interface MetricIconProps {
  icon: string
  className?: string
}

export function MetricIcon({ icon, className }: MetricIconProps) {
  const iconKey = icon as keyof typeof Icons
  const IconComponent = Icons[iconKey] || Icons.award

  return <IconComponent className={cn("h-5 w-5", className)} />
}
