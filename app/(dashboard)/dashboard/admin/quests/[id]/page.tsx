import { notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { getQuestById, getQuestStatistics } from "@/app/actions/quest-actions"
import { QuestObjectives } from "@/components/quests/quest-objectives"
import { QuestRewards } from "@/components/quests/quest-rewards"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Trash2, BarChart2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export const dynamic = "force-dynamic"

interface QuestDetailPageProps {
  params: {
    id: string
  }
}

export default async function AdminQuestDetailPage({ params }: QuestDetailPageProps) {
  const { id } = params
  const supabase = await createServerClient()

  // Get the current user and check if admin
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please sign in to access admin features</p>
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">You do not have permission to access this page</p>
      </div>
    )
  }

  // Get the quest
  const { data: quest, error } = await getQuestById(id)

  if (error || !quest) {
    notFound()
  }

  // Get quest statistics
  const { data: statistics } = await getQuestStatistics(id)

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/quests"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quest Management
      </Link>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">{quest.title}</h1>
        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/admin/quests/${id}/edit`}>
              <Edit className="mr-2 h-4 w-4" /> Edit Quest
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href={`/dashboard/quests/${id}`}>
              <BarChart2 className="mr-2 h-4 w-4" /> View Public
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quest Details</CardTitle>
              <CardDescription>Basic information about this quest</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  <p className="mt-1">{quest.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Start Date</h3>
                    <p className="mt-1">{new Date(quest.start_date).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">End Date</h3>
                    <p className="mt-1">
                      {quest.end_date ? new Date(quest.end_date).toLocaleDateString() : "No end date"}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Difficulty</h3>
                    <p className="mt-1 capitalize">{quest.difficulty}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Points</h3>
                    <p className="mt-1">{quest.points}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
                    <div className="mt-1">
                      {quest.is_active ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Featured</h3>
                    <div className="mt-1">
                      {quest.is_featured ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          Featured
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Featured</Badge>
                      )}
                    </div>
                  </div>
                </div>

                {quest.max_participants && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Max Participants</h3>
                    <p className="mt-1">{quest.max_participants}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Objectives</CardTitle>
              <CardDescription>Tasks users need to complete</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestObjectives objectives={quest.objectives || []} isAdminView />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rewards</CardTitle>
              <CardDescription>What users receive upon completion</CardDescription>
            </CardHeader>
            <CardContent>
              <QuestRewards quest={quest} isAdminView />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Quest Statistics</CardTitle>
              <CardDescription>Participation and completion data</CardDescription>
            </CardHeader>
            <CardContent>
              {statistics ? (
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Participants</h3>
                      <span className="text-sm text-muted-foreground">{statistics.participant_count}</span>
                    </div>
                    {quest.max_participants && (
                      <Progress
                        value={(statistics.participant_count / quest.max_participants) * 100}
                        className="mt-2 h-2"
                      />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium">Completion Rate</h3>
                      <span className="text-sm text-muted-foreground">{statistics.completion_rate.toFixed(1)}%</span>
                    </div>
                    <Progress value={statistics.completion_rate} className="mt-2 h-2" />
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-2">
                    <div className="rounded-lg border p-2 text-center">
                      <p className="text-xs text-muted-foreground">Completed</p>
                      <p className="text-lg font-medium">{statistics.completion_count}</p>
                    </div>
                    <div className="rounded-lg border p-2 text-center">
                      <p className="text-xs text-muted-foreground">In Progress</p>
                      <p className="text-lg font-medium">{statistics.in_progress_count}</p>
                    </div>
                    <div className="rounded-lg border p-2 text-center">
                      <p className="text-xs text-muted-foreground">Abandoned</p>
                      <p className="text-lg font-medium">{statistics.abandonment_count}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground">No statistics available</p>
              )}
            </CardContent>
          </Card>

          <Card className="border-red-200">
            <CardHeader className="text-red-600">
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>Irreversible actions</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={`/dashboard/admin/quests/${id}/delete`} method="POST">
                <Button variant="destructive" className="w-full">
                  <Trash2 className="mr-2 h-4 w-4" /> Delete Quest
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
