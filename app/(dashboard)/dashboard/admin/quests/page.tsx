import { createServerClient } from "@/lib/supabase/server"
import { getAllQuests } from "@/app/actions/quest-actions"
import { AdminQuestsList } from "@/components/admin/quests/admin-quests-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AdminQuestsPage() {
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

  // Get all quests
  const { data: quests, error } = await getAllQuests()

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <p className="text-red-500">Error loading quests: {error}</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quest Management</h2>
          <p className="text-muted-foreground">Create and manage quests for your users</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/admin/quests/create">
            <Plus className="mr-2 h-4 w-4" /> Create Quest
          </Link>
        </Button>
      </div>

      <AdminQuestsList quests={quests || []} />
    </div>
  )
}
