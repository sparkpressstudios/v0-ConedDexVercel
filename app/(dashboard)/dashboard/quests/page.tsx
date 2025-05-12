import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { QuestsList } from "@/components/quests/quests-list"
import { UserQuestsList } from "@/components/quests/user-quests-list"
import { FeaturedQuests } from "@/components/quests/featured-quests"
import { QuestsHeader } from "@/components/quests/quests-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { getFeaturedQuests, getUserQuests } from "@/app/actions/quest-actions"

export const dynamic = "force-dynamic"

export default async function QuestsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-muted-foreground">Please sign in to view quests</p>
      </div>
    )
  }

  // Get user quests
  const { data: userQuests } = await getUserQuests(user.id)

  // Get featured quests
  const { data: featuredQuests } = await getFeaturedQuests(3)

  return (
    <div className="space-y-8">
      <QuestsHeader />

      <Suspense fallback={<Skeleton className="h-[300px] w-full" />}>
        <FeaturedQuests quests={featuredQuests || []} />
      </Suspense>

      <Tabs defaultValue="my-quests" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="my-quests">My Quests</TabsTrigger>
          <TabsTrigger value="available-quests">Available Quests</TabsTrigger>
        </TabsList>

        <TabsContent value="my-quests" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <UserQuestsList userQuests={userQuests || []} />
          </Suspense>
        </TabsContent>

        <TabsContent value="available-quests" className="mt-6">
          <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
            <QuestsList />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  )
}
