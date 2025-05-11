/**
 * Validates that required environment variables are present
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  // Server-side only variables
  const requiredServerVars = [
    "SENDGRID_API_KEY",
    "SENDGRID_FROM_EMAIL",
    "VAPID_PRIVATE_KEY",
    "POSTGRES_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
    "GOOGLE_MAPS_API_KEY", // Server-side only Google Maps API key
  ]

  // Client-side safe variables
  const requiredClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
  ]

  const isServer = typeof window === "undefined"
  const varsToCheck = isServer ? [...requiredServerVars, ...requiredClientVars] : requiredClientVars

  const missingVars = varsToCheck.filter((varName) => !process.env[varName])

  return {
    valid: missingVars.length === 0,
    missing: missingVars,
  }
}

/**
 * Logs warnings for missing environment variables
 */
export function checkEnvironmentVariables(): void {
  const { valid, missing } = validateEnvironmentVariables()

  if (!valid) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`)
    console.warn("Some features may not work correctly without these variables.")
  }
}
