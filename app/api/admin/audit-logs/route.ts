import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function GET(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: roleError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (roleError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get query parameters
    const url = new URL(request.url)
    const limit = Number.parseInt(url.searchParams.get("limit") || "100")
    const offset = Number.parseInt(url.searchParams.get("offset") || "0")
    const action = url.searchParams.get("action")
    const resourceType = url.searchParams.get("resourceType")
    const startDate = url.searchParams.get("startDate")
    const endDate = url.searchParams.get("endDate")
    const search = url.searchParams.get("search")

    // Build query
    let query = supabase
      .from("admin_audit_log")
      .select(`
        *,
        admin:admin_id(email, name)
      `)
      .order("created_at", { ascending: false })

    // Apply filters
    if (action) {
      query = query.eq("action", action)
    }

    if (resourceType) {
      query = query.eq("resource_type", resourceType)
    }

    if (startDate) {
      query = query.gte("created_at", startDate)
    }

    if (endDate) {
      query = query.lte("created_at", endDate)
    }

    if (search) {
      query = query.or(`resource_id.ilike.%${search}%,details.ilike.%${search}%`)
    }

    // Apply pagination
    const { data: logs, error: logsError, count } = await query.range(offset, offset + limit - 1).limit(limit)

    if (logsError) {
      console.error("Error fetching audit logs:", logsError)
      return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
    }

    // Get total count for pagination
    const { count: totalCount, error: countError } = await supabase
      .from("admin_audit_log")
      .select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error counting audit logs:", countError)
      // Continue anyway, just won't have total count
    }

    // Get available actions and resource types for filters
    const { data: actions, error: actionsError } = await supabase.from("admin_audit_log").select("action").distinct()

    const { data: resourceTypes, error: resourceTypesError } = await supabase
      .from("admin_audit_log")
      .select("resource_type")
      .distinct()

    return NextResponse.json({
      logs,
      pagination: {
        offset,
        limit,
        total: totalCount || undefined,
      },
      filters: {
        actions: actionsError ? [] : actions?.map((a) => a.action).filter(Boolean),
        resourceTypes: resourceTypesError ? [] : resourceTypes?.map((r) => r.resource_type).filter(Boolean),
      },
    })
  } catch (error) {
    console.error("Unexpected error in audit logs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Add a new audit log entry
export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createClient(cookieStore)

    // Check if user is admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: userData, error: roleError } = await supabase.from("users").select("role").eq("id", user.id).single()

    if (roleError || !userData || userData.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get log data from request
    const body = await request.json()
    const { action, resourceType, resourceId, details } = body

    if (!action || !resourceType) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Insert new log entry
    const { data: log, error: insertError } = await supabase
      .from("admin_audit_log")
      .insert({
        admin_id: user.id,
        action,
        resource_type: resourceType,
        resource_id: resourceId || null,
        details: details || null,
        ip_address: request.headers.get("x-forwarded-for") || null,
        user_agent: request.headers.get("user-agent") || null,
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error creating audit log:", insertError)
      return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
    }

    return NextResponse.json({ success: true, log })
  } catch (error) {
    console.error("Unexpected error in audit logs API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
