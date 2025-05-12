"use server"

import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/lib/database.types"
import { logAdminAction } from "./audit-log-actions"

// Role management
export async function getRoles() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase.from("admin_roles").select("*").order("name", { ascending: true })

    if (error) {
      console.error("Error fetching roles:", error)
      return { success: false, error: error.message }
    }

    return { success: true, roles: data }
  } catch (error) {
    console.error("Error in getRoles:", error)
    return { success: false, error: String(error) }
  }
}

export async function createRole({
  name,
  description,
}: {
  name: string
  description?: string
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("admin_roles")
      .insert({
        name,
        description,
        is_system: false,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating role:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "create",
      entityType: "role",
      entityId: data.id,
      newState: data,
      details: { summary: `Created role: ${name}` },
    })

    return { success: true, role: data }
  } catch (error) {
    console.error("Error in createRole:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateRole({
  id,
  name,
  description,
}: {
  id: string
  name?: string
  description?: string
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase.from("admin_roles").select("*").eq("id", id).single()

    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (description !== undefined) updates.description = description
    updates.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from("admin_roles")
      .update(updates)
      .eq("id", id)
      .not("is_system", "eq", true) // Prevent updating system roles
      .select()
      .single()

    if (error) {
      console.error("Error updating role:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "role",
      entityId: id,
      previousState,
      newState: data,
      details: { summary: `Updated role: ${data.name}` },
    })

    return { success: true, role: data }
  } catch (error) {
    console.error("Error in updateRole:", error)
    return { success: false, error: String(error) }
  }
}

export async function deleteRole(id: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase.from("admin_roles").select("*").eq("id", id).single()

    // Prevent deleting system roles
    if (previousState.is_system) {
      return { success: false, error: "Cannot delete system roles" }
    }

    const { error } = await supabase.from("admin_roles").delete().eq("id", id).not("is_system", "eq", true) // Extra protection

    if (error) {
      console.error("Error deleting role:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "delete",
      entityType: "role",
      entityId: id,
      previousState,
      details: { summary: `Deleted role: ${previousState.name}` },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in deleteRole:", error)
    return { success: false, error: String(error) }
  }
}

// Permission management
export async function getPermissions() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("admin_permissions")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (error) {
      console.error("Error fetching permissions:", error)
      return { success: false, error: error.message }
    }

    return { success: true, permissions: data }
  } catch (error) {
    console.error("Error in getPermissions:", error)
    return { success: false, error: String(error) }
  }
}

export async function getRoleWithPermissions(roleId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the role
    const { data: role, error: roleError } = await supabase.from("admin_roles").select("*").eq("id", roleId).single()

    if (roleError) {
      console.error("Error fetching role:", roleError)
      return { success: false, error: roleError.message }
    }

    // Get the permissions for this role
    const { data: rolePermissions, error: permissionsError } = await supabase
      .from("admin_role_permissions")
      .select(`
        permission_id,
        admin_permissions (
          id,
          name,
          key,
          description,
          category
        )
      `)
      .eq("role_id", roleId)

    if (permissionsError) {
      console.error("Error fetching role permissions:", permissionsError)
      return { success: false, error: permissionsError.message }
    }

    // Get all available permissions
    const { data: allPermissions, error: allPermissionsError } = await supabase
      .from("admin_permissions")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true })

    if (allPermissionsError) {
      console.error("Error fetching all permissions:", allPermissionsError)
      return { success: false, error: allPermissionsError.message }
    }

    // Format the response
    const formattedPermissions = allPermissions.map((permission) => {
      const hasPermission = rolePermissions.some((rp) => rp.permission_id === permission.id)

      return {
        ...permission,
        granted: hasPermission,
      }
    })

    return {
      success: true,
      role,
      permissions: formattedPermissions,
    }
  } catch (error) {
    console.error("Error in getRoleWithPermissions:", error)
    return { success: false, error: String(error) }
  }
}

export async function updateRolePermissions({
  roleId,
  permissions,
}: {
  roleId: string
  permissions: {
    permissionId: string
    granted: boolean
  }[]
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current state for audit log
    const { data: previousState } = await supabase
      .from("admin_role_permissions")
      .select("permission_id")
      .eq("role_id", roleId)

    // Get the role name for the audit log
    const { data: role } = await supabase.from("admin_roles").select("name").eq("id", roleId).single()

    // Process each permission
    for (const permission of permissions) {
      if (permission.granted) {
        // Add the permission if it doesn't exist
        const { data: existingMapping } = await supabase
          .from("admin_role_permissions")
          .select("*")
          .eq("role_id", roleId)
          .eq("permission_id", permission.permissionId)
          .maybeSingle()

        if (!existingMapping) {
          await supabase.from("admin_role_permissions").insert({
            role_id: roleId,
            permission_id: permission.permissionId,
          })
        }
      } else {
        // Remove the permission if it exists
        await supabase
          .from("admin_role_permissions")
          .delete()
          .eq("role_id", roleId)
          .eq("permission_id", permission.permissionId)
      }
    }

    // Get the new state for audit log
    const { data: newState } = await supabase
      .from("admin_role_permissions")
      .select("permission_id")
      .eq("role_id", roleId)

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "role",
      entityId: roleId,
      previousState: { permissions: previousState },
      newState: { permissions: newState },
      details: {
        summary: `Updated permissions for role: ${role?.name}`,
        permissionCount: permissions.length,
        grantedPermissions: permissions.filter((p) => p.granted).length,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in updateRolePermissions:", error)
    return { success: false, error: String(error) }
  }
}

// User role management
export async function getUserRoles(userId: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    const { data, error } = await supabase
      .from("admin_user_roles")
      .select(`
        role_id,
        admin_roles (
          id,
          name,
          description
        )
      `)
      .eq("user_id", userId)

    if (error) {
      console.error("Error fetching user roles:", error)
      return { success: false, error: error.message }
    }

    return {
      success: true,
      roles: data.map((item) => item.admin_roles),
    }
  } catch (error) {
    console.error("Error in getUserRoles:", error)
    return { success: false, error: String(error) }
  }
}

export async function assignRoleToUser({
  userId,
  roleId,
}: {
  userId: string
  roleId: string
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Check if the user already has this role
    const { data: existingRole } = await supabase
      .from("admin_user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role_id", roleId)
      .maybeSingle()

    if (existingRole) {
      return { success: true, message: "User already has this role" }
    }

    // Get user and role details for the audit log
    const { data: user } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()

    const { data: role } = await supabase.from("admin_roles").select("name").eq("id", roleId).single()

    // Assign the role
    const { error } = await supabase.from("admin_user_roles").insert({
      user_id: userId,
      role_id: roleId,
    })

    if (error) {
      console.error("Error assigning role to user:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "user",
      entityId: userId,
      details: {
        summary: `Assigned role ${role?.name} to user ${user?.full_name || user?.email}`,
        roleId,
        roleName: role?.name,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in assignRoleToUser:", error)
    return { success: false, error: String(error) }
  }
}

export async function removeRoleFromUser({
  userId,
  roleId,
}: {
  userId: string
  roleId: string
}) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get user and role details for the audit log
    const { data: user } = await supabase.from("profiles").select("email, full_name").eq("id", userId).single()

    const { data: role } = await supabase.from("admin_roles").select("name").eq("id", roleId).single()

    // Remove the role
    const { error } = await supabase.from("admin_user_roles").delete().eq("user_id", userId).eq("role_id", roleId)

    if (error) {
      console.error("Error removing role from user:", error)
      return { success: false, error: error.message }
    }

    // Log the admin action
    await logAdminAction({
      actionType: "update",
      entityType: "user",
      entityId: userId,
      details: {
        summary: `Removed role ${role?.name} from user ${user?.full_name || user?.email}`,
        roleId,
        roleName: role?.name,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error in removeRoleFromUser:", error)
    return { success: false, error: String(error) }
  }
}

// Check if the current user has a specific permission
export async function checkPermission(permissionKey: string) {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, hasPermission: false, error: "No authenticated user" }
    }

    // Check if the user has the permission
    const { data, error } = await supabase.rpc("check_admin_permission", {
      p_user_id: user.id,
      p_permission_key: permissionKey,
    })

    if (error) {
      console.error("Error checking permission:", error)
      return { success: false, hasPermission: false, error: error.message }
    }

    return { success: true, hasPermission: data }
  } catch (error) {
    console.error("Error in checkPermission:", error)
    return { success: false, hasPermission: false, error: String(error) }
  }
}

// Get all permissions for the current user
export async function getUserPermissions() {
  try {
    const supabase = createServerComponentClient<Database>({ cookies })

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, permissions: [], error: "No authenticated user" }
    }

    // Get the user's permissions
    const { data, error } = await supabase.rpc("get_user_permissions", {
      p_user_id: user.id,
    })

    if (error) {
      console.error("Error getting user permissions:", error)
      return { success: false, permissions: [], error: error.message }
    }

    return { success: true, permissions: data || [] }
  } catch (error) {
    console.error("Error in getUserPermissions:", error)
    return { success: false, permissions: [], error: String(error) }
  }
}
