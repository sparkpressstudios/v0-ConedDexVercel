"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { getSession } from "@/lib/auth/session"
import { z } from "zod"

// Define the expected CSV row structure
const UserRowSchema = z.object({
  email: z.string().email("Invalid email format").trim().toLowerCase(),
  full_name: z.string().min(1, "Name is required").trim(),
  username: z.string().trim().optional(),
  avatar_url: z.string().url("Invalid URL format").optional().nullable(),
  bio: z.string().max(500, "Bio must be 500 characters or less").optional().nullable(),
  location: z.string().max(100, "Location must be 100 characters or less").optional().nullable(),
  update_if_exists: z.boolean().optional().default(false),
})

type UserRow = z.infer<typeof UserRowSchema>
type ImportResult = {
  success: boolean
  created: number
  updated: number
  skipped: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
  warnings: Array<{ row: number; email: string; message: string }>
}

// Adding the missing export that was flagged in the deployment error
export async function importUsers(formData: FormData): Promise<ImportResult> {
  // This is an alias for importUsersFromCSV to maintain backward compatibility
  return importUsersFromCSV(formData)
}

export async function importUsersFromCSV(formData: FormData): Promise<ImportResult> {
  // Check if user is admin
  const session = await getSession()
  if (!session || session.user.role !== "admin") {
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [{ row: 0, email: "", error: "Unauthorized: Only admins can import users" }],
      warnings: [],
    }
  }

  const file = formData.get("file") as File
  const updateIfExists = formData.get("updateIfExists") === "true"

  if (!file) {
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [{ row: 0, email: "", error: "No file provided" }],
      warnings: [],
    }
  }

  // Check file type and size
  if (!file.name.endsWith(".csv")) {
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [{ row: 0, email: "", error: "File must be a CSV" }],
      warnings: [],
    }
  }

  // Limit file size to 5MB
  const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
  if (file.size > MAX_FILE_SIZE) {
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [{ row: 0, email: "", error: "File size exceeds the 5MB limit" }],
      warnings: [],
    }
  }

  try {
    const csvText = await file.text()
    const rows = parseCSV(csvText)

    if (rows.length === 0) {
      return {
        success: false,
        created: 0,
        updated: 0,
        skipped: 0,
        failed: 0,
        errors: [{ row: 0, email: "", error: "CSV file is empty or invalid" }],
        warnings: [],
      }
    }

    // Process the rows
    const result = await processUsers(rows, updateIfExists)

    // Revalidate the users page to show the new users
    revalidatePath("/dashboard/admin/users")

    return result
  } catch (error) {
    console.error("Error importing users:", error)
    return {
      success: false,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: [
        {
          row: 0,
          email: "",
          error: `Failed to process CSV file: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
      ],
      warnings: [],
    }
  }
}

// Parse CSV text into an array of objects with improved handling
function parseCSV(csvText: string): Array<Record<string, string>> {
  // Handle different line endings (CRLF, LF)
  const lines = csvText.replace(/\r\n/g, "\n").split("\n")
  if (lines.length < 2) return []

  // Parse headers, handling quoted values
  const headers = parseCSVLine(lines[0])

  // Validate required headers
  const requiredHeaders = ["email", "full_name"]
  const missingHeaders = requiredHeaders.filter((h) => !headers.includes(h))
  if (missingHeaders.length > 0) {
    throw new Error(`Missing required headers: ${missingHeaders.join(", ")}`)
  }

  return lines
    .slice(1)
    .filter((line) => line.trim() !== "")
    .map((line, index) => {
      try {
        const values = parseCSVLine(line)
        return headers.reduce(
          (obj, header, i) => {
            obj[header] = values[i] || ""
            return obj
          },
          {} as Record<string, string>,
        )
      } catch (error) {
        throw new Error(`Error parsing line ${index + 2}: ${error instanceof Error ? error.message : "Invalid format"}`)
      }
    })
}

// Helper function to parse CSV line, handling quoted values
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let inQuotes = false
  let currentValue = ""

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"' && inQuotes && nextChar === '"') {
      // Handle escaped quotes
      currentValue += '"'
      i++
    } else if (char === '"') {
      // Toggle quote state
      inQuotes = !inQuotes
    } else if (char === "," && !inQuotes) {
      // End of value
      result.push(currentValue.trim())
      currentValue = ""
    } else {
      // Add character to current value
      currentValue += char
    }
  }

  // Add the last value
  result.push(currentValue.trim())
  return result
}

// Process users and create/update accounts
async function processUsers(rows: Array<Record<string, string>>, globalUpdateIfExists: boolean): Promise<ImportResult> {
  const supabase = createClient()
  const result: ImportResult = {
    success: true,
    created: 0,
    updated: 0,
    skipped: 0,
    failed: 0,
    errors: [],
    warnings: [],
  }

  // Generate a secure temporary password for new users
  const generateTempPassword = () => {
    const length = 16
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()-_=+"
    let password = ""
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length)
      password += charset[randomIndex]
    }
    return password
  }

  // Process in batches to avoid overwhelming the database
  const BATCH_SIZE = 50
  const batches = []

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    batches.push(rows.slice(i, i + BATCH_SIZE))
  }

  for (const batch of batches) {
    // First, collect all emails to check existence in a single query
    const emails = batch.map((row) => row.email).filter(Boolean)

    // Check which emails already exist
    const { data: existingUsers } = await supabase.from("profiles").select("id, email").in("email", emails)

    const existingEmails = new Map(existingUsers?.map((user) => [user.email.toLowerCase(), user.id]) || [])

    // Process each row in the batch
    for (let i = 0; i < batch.length; i++) {
      const rowNum = i + 2 // +2 because we skip header row and 0-indexing
      const row = batch[i]

      try {
        // Add update_if_exists from global setting if not specified in row
        if (globalUpdateIfExists && row.update_if_exists === undefined) {
          row.update_if_exists = "true"
        }

        // Validate the row data
        const validatedData = UserRowSchema.parse({
          ...row,
          update_if_exists: row.update_if_exists === "true",
        })

        const email = validatedData.email.toLowerCase()
        const existingUserId = existingEmails.get(email)

        // Check if user already exists
        if (existingUserId) {
          if (validatedData.update_if_exists) {
            // Update existing user
            const { error: updateError } = await supabase
              .from("profiles")
              .update({
                full_name: validatedData.full_name,
                username: validatedData.username || email.split("@")[0],
                avatar_url: validatedData.avatar_url || null,
                bio: validatedData.bio || null,
                location: validatedData.location || null,
                updated_at: new Date().toISOString(),
              })
              .eq("id", existingUserId)

            if (updateError) {
              result.failed++
              result.errors.push({
                row: rowNum,
                email,
                error: `Failed to update user: ${updateError.message}`,
              })
            } else {
              result.updated++
            }
          } else {
            // Skip existing user
            result.skipped++
            result.warnings.push({
              row: rowNum,
              email,
              message: "User already exists and update_if_exists is false",
            })
          }
          continue
        }

        // Create the user account
        const tempPassword = generateTempPassword()

        // Create auth user
        const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
          user_metadata: {
            full_name: validatedData.full_name,
            imported: true,
            import_date: new Date().toISOString(),
          },
        })

        if (authError) {
          result.failed++
          result.errors.push({
            row: rowNum,
            email,
            error: `Auth creation failed: ${authError.message}`,
          })
          continue
        }

        // Create profile
        const { error: profileError } = await supabase
          .from("profiles")
          .update({
            full_name: validatedData.full_name,
            username: validatedData.username || email.split("@")[0],
            avatar_url: validatedData.avatar_url || null,
            bio: validatedData.bio || null,
            location: validatedData.location || null,
            role: "explorer", // Set role as explorer
            email_verified: true,
          })
          .eq("id", authUser.user.id)

        if (profileError) {
          result.failed++
          result.errors.push({
            row: rowNum,
            email,
            error: `Profile creation failed: ${profileError.message}`,
          })
          continue
        }

        result.created++
      } catch (error) {
        result.failed++
        result.errors.push({
          row: rowNum,
          email: row.email || "Unknown",
          error:
            error instanceof z.ZodError
              ? error.errors.map((e) => `${e.path}: ${e.message}`).join(", ")
              : error instanceof Error
                ? error.message
                : "Invalid data format",
        })
      }
    }
  }

  result.success = result.failed === 0 || result.created > 0 || result.updated > 0
  return result
}
