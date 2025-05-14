"use server"

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

interface UserImportData {
  email: string
  full_name?: string
  username?: string
  role?: string
  team_id?: string
}

export async function importUsers(csvData: string) {
  const supabase = createServerActionClient({ cookies })

  try {
    // Parse CSV data
    const lines = csvData.split("\n")
    const headers = lines[0].split(",").map((h) => h.trim())

    const users: UserImportData[] = []
    const errors: { line: number; message: string }[] = []

    // Process each line (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim()
      if (!line) continue

      const values = line.split(",").map((v) => v.trim())
      const user: UserImportData = { email: "" }

      // Map values to user object
      headers.forEach((header, index) => {
        if (values[index] !== undefined) {
          switch (header) {
            case "email":
              user.email = values[index]
              break
            case "full_name":
              user.full_name = values[index]
              break
            case "username":
              user.username = values[index]
              break
            case "role":
              user.role = values[index]
              break
            case "team_id":
              user.team_id = values[index] || undefined
              break
          }
        }
      })

      // Validate email
      if (!user.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
        errors.push({ line: i + 1, message: "Invalid email address" })
        continue
      }

      users.push(user)
    }

    // Check if we have any valid users to import
    if (users.length === 0) {
      return {
        success: false,
        message: "No valid users found to import",
        errors,
      }
    }

    // Get current user for audit
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    // Import users
    const results = {
      success: 0,
      failed: 0,
      errors: [] as { email: string; message: string }[],
    }

    for (const user of users) {
      try {
        // Check if user already exists
        const { data: existingUser } = await supabase.from("profiles").select("id").eq("email", user.email).single()

        if (existingUser) {
          // Update existing user
          const { error: updateError } = await supabase
            .from("profiles")
            .update({
              full_name: user.full_name,
              username: user.username,
              role: user.role,
              team_id: user.team_id,
              updated_at: new Date().toISOString(),
            })
            .eq("email", user.email)

          if (updateError) {
            results.failed++
            results.errors.push({ email: user.email, message: updateError.message })
          } else {
            results.success++
          }
        } else {
          // Create new user
          const { error: insertError } = await supabase.from("profiles").insert({
            email: user.email,
            full_name: user.full_name || "",
            username: user.username || "",
            role: user.role || "user",
            team_id: user.team_id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            results.failed++
            results.errors.push({ email: user.email, message: insertError.message })
          } else {
            results.success++
          }
        }

        // Log to audit trail
        await supabase.from("admin_audit_logs").insert({
          user_id: currentUser?.id,
          action: "import_user",
          resource_type: "user",
          resource_id: user.email,
          details: { user },
        })
      } catch (error) {
        results.failed++
        results.errors.push({
          email: user.email,
          message: error instanceof Error ? error.message : "Unknown error",
        })
      }
    }

    // Revalidate users page
    revalidatePath("/dashboard/admin/users")

    return {
      success: true,
      message: `Successfully imported ${results.success} users. Failed: ${results.failed}`,
      results,
    }
  } catch (error) {
    console.error("Error importing users:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error occurred during import",
    }
  }
}
