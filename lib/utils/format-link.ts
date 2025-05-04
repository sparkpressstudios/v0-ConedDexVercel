/**
 * Utility function to ensure links are properly formatted
 * Removes route group patterns and ensures consistent formatting
 */
export function formatLink(path: string): string {
  // Remove route group patterns
  let formattedPath = path.replace(/\/$$[^)]+$$\//g, "/")

  // Ensure dashboard links are properly formatted
  if (formattedPath.includes("dashboard")) {
    formattedPath = formattedPath.replace(/\/+dashboard/, "/dashboard")
  }

  // Handle flavor-log to log-flavor conversion
  if (formattedPath.includes("/flavor-log")) {
    formattedPath = formattedPath.replace("/flavor-log", "/log-flavor")
  }

  return formattedPath
}
