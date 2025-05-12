import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { getQuestById, getUserQuests } from "@/app/actions/quest-actions"
import { QuestDetails } from "@/components/quests/quest-details"
import { QuestObjectives } from "@/components/quests/quest-objectives"
import { QuestRewards } from "@/components/quests/quest-rewards"
import { QuestActions } from "@/components/quests/quest-actions"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

interface QuestPageProps {
  params: {
    id: string
  }
}

export default async function QuestPage({ params }: QuestPageProps) {
  const { id } = params
  const supabase = await createServerClient()

  // Get the quest
  const { data: quest, error } = await getQuestById(id)

  if (error || !quest) {
    notFound()
  }

  // Get the current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please sign in to view quest details</p>
      </div>
    )
  }

  // Check if user has joined this quest
  const { data: userQuests } = await getUserQuests(user.id)
  const userQuest = userQuests?.find((uq) => uq.quest_id === id)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/quests"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quests
      </Link>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <QuestDetails quest={quest} />

          <Card>
            <CardHeader>
              <CardTitle>Objectives</CardTitle>
              <CardDescription>Complete these objectives to finish the quest</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestObjectives objectives={quest.objectives || []} userQuest={userQuest} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <QuestActions quest={quest} userQuest={userQuest} />

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>Earn these rewards upon completion</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestRewards rewards={quest.rewards || []} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
