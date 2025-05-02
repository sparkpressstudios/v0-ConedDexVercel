import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET() {
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

    // Fetch all scheduled reports
    const { data: reports, error } = await supabase
      .from("scheduled_reports")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Fetch entity names for reports
    const enhancedReports = await Promise.all(
      reports.map(async (report) => {
        let entityName = undefined

        if (report.type === "shop_report" || report.type === "flavor_catalog") {
          const { data: shop } = await supabase.from("shops").select("name").eq("id", report.entityId).single()

          if (shop) {
            entityName = shop.name
          }
        }

        return {
          ...report,
          entityName,
        }
      }),
    )

    return NextResponse.json({ reports: enhancedReports })
  } catch (error) {
    console.error("Error fetching scheduled reports:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch scheduled reports" },
      { status: 500 },
    )
  }
}
