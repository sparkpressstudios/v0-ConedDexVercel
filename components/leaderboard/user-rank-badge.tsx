import { cn } from "@/lib/utils"
import { Trophy } from "lucide-react"

interface UserRankBadgeProps {
  rank: number
  className?: string
}

export function UserRankBadge({ rank, className }: UserRankBadgeProps) {
  // Special styling for top 3 ranks
  if (rank === 1) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-yellow-500 text-white font-bold",
          className,
        )}
      >
        <Trophy className="h-4 w-4" />
      </div>
    )
  }

  if (rank === 2) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-gray-400 text-white font-bold",
          className,
        )}
      >
        {rank}
      </div>
    )
  }

  if (rank === 3) {
    return (
      <div
        className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-bold",
          className,
        )}
      >
        {rank}
      </div>
    )
  }

  // Default styling for other ranks
  return (
    <div
      className={cn(
        "flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-bold",
        className,
      )}
    >
      {rank}
    </div>
  )
}
