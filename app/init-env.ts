"use server"

import { checkEnvironmentVariables } from "@/lib/utils/env-validator"

// Check environment variables on server startup
export async function initEnvironment() {
  try {
    checkEnvironmentVariables()
    return { success: true }
  } catch (error) {
    console.error("Error checking environment variables:", error)
    return {
      success: false,
      error: "Failed to check environment variables. The application may not function correctly.",
    }
  }
}
