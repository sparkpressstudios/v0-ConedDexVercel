/**
 * Validates that required environment variables are present
 */
export function validateEnvironmentVariables(): { valid: boolean; missing: string[] } {
  const requiredServerVars = [
    "SENDGRID_API_KEY",
    "SENDGRID_FROM_EMAIL",
    "VAPID_PRIVATE_KEY",
    "POSTGRES_URL",
    "SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_JWT_SECRET",
    "GOOGLE_MAPS_API_KEY",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "OPENAI_API_KEY",
  ]

  // Client-side variables are now considered optional for production
  const optionalClientVars = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "NEXT_PUBLIC_SITE_URL",
    "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  ]

  const isServer = typeof window === "undefined"
  const isProduction = process.env.NODE_ENV === "production"

  // In production, we'll only check server variables as critical
  const varsToCheck =
    isServer && !isProduction ? [...requiredServerVars, ...optionalClientVars] : isServer ? requiredServerVars : []

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

  // Check for optional client variables in production
  const isProduction = process.env.NODE_ENV === "production"
  const isClient = typeof window !== "undefined"

  if (isProduction && isClient) {
    const optionalClientVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ]

    const missingOptional = optionalClientVars.filter((varName) => !process.env[varName])

    if (missingOptional.length > 0) {
      console.log("Note: Some optional client environment variables are not set:", missingOptional.join(", "))
    }
  }
}
