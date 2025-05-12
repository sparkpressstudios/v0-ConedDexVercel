import { Award, BadgeCheck, Trophy, Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Quest, RewardType } from "@/types/quests"

export function QuestRewards({
  quest,
  isCompleted = false,
}: {
  quest: Quest
  isCompleted?: boolean
}) {
  if (!quest.rewards || quest.rewards.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center">
        <h3 className="mb-2 text-lg font-medium">No rewards</h3>
        <p className="text-muted-foreground">This quest doesn't have any rewards.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg border p-4">
        <h3 className="mb-4 text-lg font-medium">Quest Rewards</h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {quest.rewards.map((reward) => (
            <RewardItem key={reward.id} reward={reward} isCompleted={isCompleted} />
          ))}
        </div>
      </div>
    </div>
  )
}

function RewardItem({
  reward,
  isCompleted = false,
}: {
  reward: any
  isCompleted?: boolean
}) {
  const getRewardIcon = (type: RewardType) => {
    switch (type) {
      case "badge":
        return <BadgeCheck className="h-5 w-5 text-blue-500" />
      case "points":
        return <Award className="h-5 w-5 text-yellow-500" />
      case "title":
        return <Trophy className="h-5 w-5 text-purple-500" />
      default:
        return <Gift className="h-5 w-5 text-pink-500" />
    }
  }

  const getRewardTitle = (reward: any) => {
    switch (reward.reward_type) {
      case "badge":
        return `Badge: ${reward.description || "Special Badge"}`
      case "points":
        return `${reward.points} Points`
      case "title":
        return `Title: ${reward.description || "Special Title"}`
      default:
        return reward.description || "Custom Reward"
    }
  }

  const getRewardDescription = (reward: any) => {
    switch (reward.reward_type) {
      case "badge":
        return "A special badge to display on your profile"
      case "points":
        return "Points to boost your leaderboard ranking"
      case "title":
        return "A unique title to show off your achievement"
      default:
        return reward.description || "A special reward for completing this quest"
    }
  }

  return (
    <Card className={isCompleted ? "border-green-200 bg-green-50" : ""}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full border">
          {getRewardIcon(reward.reward_type)}
        </div>
        <div>
          <CardTitle className="text-base">{getRewardTitle(reward)}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription>{getRewardDescription(reward)}</CardDescription>

        {isCompleted && <Badge className="mt-2 bg-green-100 text-green-800">Earned</Badge>}
      </CardContent>
    </Card>
  )
}
