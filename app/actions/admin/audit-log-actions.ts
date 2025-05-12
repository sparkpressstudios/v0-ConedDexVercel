"use server"

import { cookies, headers } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"

export type AuditAction =
  | "create"
  | "update"
  | "delete"
  | "view"
  | "login"
  | "logout"
  | "approve"
  | "reject"
  | "import"
  | "export"
  | "bulk_action"
  | "settings_change"
  | "permission_change"
  | "subscription_change"

export type EntityType =
  | "user"
  | "shop"
  | "flavor"
  | "badge"
  | "subscription"
  | "feature"
  | "setting"
  | "role"
  | "permission"
  | "newsletter"
  | "report"

interface AuditLogParams {
  actionType: AuditAction
  entityType: EntityType
  entityId?: string
  previousState?: any
  newState?: any
  details?: Record<string, any>
}

export async function logAdminAction({
  actionType,
  entityType,
  entityId,
  previousState,
  newState,
  details,
}: AuditLogParams) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get current admin user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("No authenticated user found")
    }

    // Get IP address and user agent
    const headersList = headers()
    const ipAddress = headersList.get("x-forwarded-for") || "unknown"
    const userAgent = headersList.get("user-agent") || "unknown"

    // Call the database function to log the action
    const { data, error } = await supabase.rpc("log_admin_action", {
      admin_id: user.id,
      action_type: actionType,
      entity_type: entityType,
      entity_id: entityId || null,
      previous_state: previousState ? JSON.stringify(previousState) : null,
      new_state: newState ? JSON.stringify(newState) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      details: details ? JSON.stringify(details) : null,
    })

    if (error) {
      console.error("Error logging admin action:", error)
      return { success: false, error: error.message }
    }

    return { success: true, logId: data }
  } catch (error) {
    console.error("Error in logAdminAction:", error)
    return { success: false, error: String(error) }
  }
}

export async function getAuditLogs({
  limit = 50,
  offset = 0,
  adminId,
  actionType,
  entityType,
  entityId,
  startDate,
  endDate,
}: {
  limit?: number
  offset?: number
  adminId?: string
  actionType?: AuditAction
  entityType?: EntityType
  entityId?: string
  startDate?: Date
  endDate?: Date
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error, count } = await supabase
      .rpc("get_audit_logs", {
        p_limit: limit,
        p_offset: offset,
        p_admin_id: adminId || null,
        p_action_type: actionType || null,
        p_entity_type: entityType || null,
        p_entity_id: entityId || null,
        p_start_date: startDate?.toISOString() || null,
        p_end_date: endDate?.toISOString() || null,
      })
      .select("*", { count: "exact" })

    if (error) {
      console.error("Error fetching audit logs:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      logs: data || [],
      total: count || 0,
    }
  } catch (error) {
    console.error("Error in getAuditLogs:", error)
    return { success: false, error: String(error) }
  }
}
