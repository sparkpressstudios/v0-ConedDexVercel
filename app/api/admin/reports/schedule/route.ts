import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { reportScheduler } from "@/lib/utils/report-scheduler"
import cron from "node-cron"

export async function POST(request: Request) {
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

    // Get request body
    const { type, entityId, schedule, options, enabled } = await request.json()

    // Validate required fields
    if (!type || !entityId || !schedule) {
      return NextResponse.json({ error: "Type, entityId, and schedule are required" }, { status: 400 })
    }

    // Validate cron expression
    if (!cron.validate(schedule)) {
      return NextResponse.json({ error: "Invalid cron expression" }, { status: 400 })
    }

    // Calculate next run time
    const nextRun = cron
      .schedule(schedule, () => {}, { scheduled: false })
      .nextDate()
      .toJSDate()

    // Create the scheduled report in the database
    const { data: report, error } = await supabase
      .from("scheduled_reports")
      .insert({
        type,
        entity_id: entityId,
        schedule,
        options: options || {},
        enabled: enabled !== undefined ? enabled : true,
        created_by: user.id,
        next_run: nextRun.toISOString(),
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      throw error
    }

    // Schedule the report if enabled
    if (report.enabled) {
      await reportScheduler.scheduleReport({
        id: report.id,
        type: report.type,
        entityId: report.entity_id,
        schedule: report.schedule,
        options: report.options,
        enabled: report.enabled,
      })
    }

    return NextResponse.json({ report })
  } catch (error) {
    console.error("Error scheduling report:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to schedule report" },
      { status: 500 },
    )
  }
}
