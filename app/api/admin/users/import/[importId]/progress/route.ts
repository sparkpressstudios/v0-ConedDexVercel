import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { getSession } from "@/lib/auth/session"

export async function GET(request: Request, { params }: { params: { importId: string } }) {
  try {
    const session = await getSession()

    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const importId = params.importId
    const supabase = createServerClient()

    // Get import job from database
    const { data: importJob, error } = await supabase
      .from("import_jobs")
      .select("*")
      .eq("id", importId)
      .eq("type", "users")
      .single()

    if (error || !importJob) {
      return NextResponse.json({ error: "Import job not found" }, { status: 404 })
    }

    // Calculate progress
    const progress = importJob.total > 0 ? (importJob.processed / importJob.total) * 100 : 0

    return NextResponse.json({
      status: importJob.status,
      progress,
      total: importJob.total,
      processed: importJob.processed,
      successful: importJob.successful,
      failed: importJob.failed,
      errors: importJob.errors || [],
      warnings: importJob.warnings || [],
      completedAt: importJob.completed_at,
    })
  } catch (error) {
    console.error("Error fetching import progress:", error)
    return NextResponse.json({ error: "Failed to fetch import progress" }, { status: 500 })
  }
}
