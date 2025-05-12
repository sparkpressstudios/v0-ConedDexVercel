import { createServerClient } from "@/lib/supabase/server"
import { QuestForm } from "@/components/admin/quests/quest-form"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function CreateQuestPage() {
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

  // Get badges for rewards
  const { data: badges } = await supabase.from("badges").select("id, name, description, image_url").order("name")

  // Get shops for objectives
  const { data: shops } = await supabase.from("shops").select("id, name, address").order("name")

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/admin/quests"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Quest Management
      </Link>

      <div>
        <h2 className="text-3xl font-bold tracking-tight">Create New Quest</h2>
        <p className="text-muted-foreground">Design a new quest for your users to complete</p>
      </div>

      <QuestForm badges={badges || []} shops={shops || []} />
    </div>
  )
}
