// Browser-compatible environment validator

// Define the required environment variables - server-side only variables
const requiredEnvVars = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
  "GOOGLE_MAPS_API_KEY", // This is only checked server-side
]

// Define the optional environment variables
const optionalEnvVars = [
  "SENDGRID_API_KEY",
  "SENDGRID_FROM_EMAIL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
  "OPENAI_API_KEY",
  "VAPID_PRIVATE_KEY",
  "VAPID_PUBLIC_KEY",
  "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
]

// Check if the required environment variables are set
export function validateRequiredEnvVars(): { valid: boolean; missing: string[] } {
  // In browser environment, we can only check NEXT_PUBLIC_ variables
  if (typeof window !== "undefined") {
    const browserCheckableVars = requiredEnvVars.filter((v) => v.startsWith("NEXT_PUBLIC_"))
    const missing = browserCheckableVars.filter((v) => !process.env[v])
    return {
      valid: missing.length === 0,
      missing,
    }
  }

  // In server environment, we can check all variables
  const missing = requiredEnvVars.filter((v) => !process.env[v])

  return {
    valid: missing.length === 0,
    missing,
  }
}

// Check if the optional environment variables are set
export function checkOptionalEnvVars(): { set: string[]; unset: string[] } {
  // In browser environment, we can only check NEXT_PUBLIC_ variables
  if (typeof window !== "undefined") {
    const browserCheckableVars = optionalEnvVars.filter((v) => v.startsWith("NEXT_PUBLIC_"))
    const set = browserCheckableVars.filter((v) => !!process.env[v])
    const unset = browserCheckableVars.filter((v) => !process.env[v])
    return { set, unset }
  }

  // In server environment, we can check all variables
  const set = optionalEnvVars.filter((v) => !!process.env[v])
  const unset = optionalEnvVars.filter((v) => !process.env[v])

  return { set, unset }
}

// Get a formatted report of the environment variables
export function getEnvReport(): string {
  const { valid, missing } = validateRequiredEnvVars()
  const { set, unset } = checkOptionalEnvVars()

  return `
Environment Variables Report:
----------------------------
Required Variables: ${valid ? "✅ All set" : "❌ Some missing"}
${missing.length > 0 ? `Missing: ${missing.join(", ")}` : ""}

Optional Variables:
Set: ${set.join(", ") || "None"}
Not Set: ${unset.join(", ") || "None"}
`
}

// Check if a specific feature is available based on environment variables
export function isFeatureAvailable(feature: "email" | "maps" | "payments" | "ai" | "push"): boolean {
  // For client-side, we need to handle differently
  if (typeof window !== "undefined") {
    switch (feature) {
      case "email":
        // Client can't check email service directly
        return false
      case "maps":
        // On client, just check if the maps API is loaded
        return typeof window.google !== "undefined" && !!window.google.maps
      case "payments":
        return !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
      case "ai":
        // Client can't check AI service directly
        return false
      case "push":
        return !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      default:
        return false
    }
  }

  // Server-side checks
  switch (feature) {
    case "email":
      return !!process.env.SENDGRID_API_KEY && !!process.env.SENDGRID_FROM_EMAIL
    case "maps":
      return !!process.env.GOOGLE_MAPS_API_KEY
    case "payments":
      return !!process.env.STRIPE_SECRET_KEY && !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    case "ai":
      return !!process.env.OPENAI_API_KEY
    case "push":
      return !!process.env.VAPID_PRIVATE_KEY && !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    default:
      return false
  }
}

/**
 * Logs warnings for missing environment variables
 * This function is kept for backward compatibility
 */
export function checkEnvironmentVariables(): void {
  const { valid, missing } = validateRequiredEnvVars()
  const isProduction = process.env.NODE_ENV === "production"

  // Only show warnings in production or if explicitly requested
  if (!valid && (isProduction || process.env.NEXT_PUBLIC_SHOW_ENV_WARNINGS === "true")) {
    console.warn(`⚠️ Missing environment variables: ${missing.join(", ")}`)
    console.warn("Some features may not work correctly without these variables.")
  } else if (!valid) {
    // In development, just log once to console in a less alarming way
    console.log("Note: Some environment variables are not set. This is normal in development.")
  }

  // Check for optional client variables only in production
  if (isProduction && typeof window !== "undefined") {
    const optionalClientVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      "NEXT_PUBLIC_SITE_URL",
      "NEXT_PUBLIC_VAPID_PUBLIC_KEY",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY",
    ]

    const missingOptional = optionalClientVars.filter((varName) => !process.env[varName])

    if (missingOptional.length > 0 && process.env.NEXT_PUBLIC_SHOW_ENV_WARNINGS === "true") {
      console.log("Note: Some optional client environment variables are not set:", missingOptional.join(", "))
    }
  }
}
