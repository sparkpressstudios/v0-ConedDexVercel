"use server"

import { checkEnvironmentVariables } from "@/lib/utils/env-validator"

// Check environment variables on server startup
export async function initEnvironment() {
  checkEnvironmentVariables()
  return { success: true }
}
