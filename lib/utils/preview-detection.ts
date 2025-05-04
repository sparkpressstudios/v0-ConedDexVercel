// Helper function to detect if we're in a preview environment
export function isPreviewEnvironment(): boolean {
  if (typeof window === "undefined") {
    // Server-side detection
    return process.env.VERCEL_ENV === "preview" || process.env.NODE_ENV === "development"
  } else {
    // Client-side detection
    const hostname = window.location.hostname
    return (
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.includes("vercel.app") ||
      hostname.includes("v0.dev") ||
      window.navigator.userAgent.includes("v0.dev")
    )
  }
}

// Helper function to create a mock user for preview environments
export function getPreviewUser() {
  return {
    id: "preview-user-id",
    username: "previewuser",
    full_name: "Preview User",
    role: "admin",
    avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=PreviewUser`,
    bio: "This is a preview user account.",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    favorite_flavor: "Vanilla",
  }
}
