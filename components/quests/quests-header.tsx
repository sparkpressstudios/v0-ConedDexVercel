import { Award, Users, Calendar, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import type { Quest } from "@/types/quests"

export function QuestsHeader({
  title = "Quests",
  description = "Complete quests to earn badges, points, and other rewards.",
  showActions = true,
}: {
  title?: string
  description?: string
  showActions?: boolean
}) {
  return (
    <div className="mb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-1 text-muted-foreground">{description}</p>
        </div>
        {showActions && (
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/quests">All Quests</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/leaderboard">Leaderboard</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export function QuestHeader({ quest, userJoined = false }: { quest: Quest; userJoined?: boolean }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "hard":
        return "bg-orange-100 text-orange-800"
      case "expert":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="mb-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">{quest.title}</h1>
            {quest.is_featured && (
              <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                Featured
              </Badge>
            )}
          </div>
          <p className="mt-1 text-muted-foreground">{quest.description}</p>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge variant="outline" className={getDifficultyColor(quest.difficulty)}>
              {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
            </Badge>
            <Badge variant="outline" className="bg-purple-100 text-purple-800">
              <Award className="mr-1 h-3 w-3" /> {quest.points} points
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-800">
              <Calendar className="mr-1 h-3 w-3" /> Started {formatDate(quest.start_date)}
            </Badge>
            {quest.end_date && (
              <Badge variant="outline" className="bg-orange-50 text-orange-800">
                <Clock className="mr-1 h-3 w-3" /> Ends {formatDate(quest.end_date)}
              </Badge>
            )}
            {quest.max_participants && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-800">
                <Users className="mr-1 h-3 w-3" /> Max {quest.max_participants} participants
              </Badge>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/dashboard/quests">Back to Quests</Link>
          </Button>
          {userJoined && (
            <Button asChild>
              <Link href="/dashboard/my-quests">My Quests</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
