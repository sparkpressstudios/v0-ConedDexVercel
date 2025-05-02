import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { reportScheduler } from "@/lib/utils/report-scheduler"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServerClient()

    // Verify admin role
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userRole } = await supabase.from("user_roles").select("role").eq("user_id", user.id).single()

    if (!userRole || userRole.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const reportId = params.id
    const { enabled } = await request.json()

    // Update the report status in the database
    const { data: report, error } = await supabase
      .from("scheduled_reports")
      .update({ enabled })
      .eq("id", reportId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update the scheduler
    if (enabled) {
      await reportScheduler.scheduleReport({
        id: report.id,
        type: report.type,
        entityId: report.entity_id,
        schedule: report.schedule,
        options: report.options,
        enabled: report.enabled,
      })
    } else {
      reportScheduler.cancelSchedule(reportId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error toggling report status:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update report status" },
      { status: 500 },
    )
  }
}
