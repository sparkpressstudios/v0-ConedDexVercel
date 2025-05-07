import { isPagesRouter } from "./utils/runtime-detection"

/**
 * Gets the appropriate component based on the current router
 * This allows for a unified import strategy across the application
 */
export function getRouterSpecificComponent(componentName: string) {
  const routerType = isPagesRouter() ? "pages" : "app"
  try {
    // Dynamic import based on current router
    return require(`../components/${routerType}/${componentName}`).default
  } catch (e) {
    // Fallback to shared components
    return require(`../components/shared/${componentName}`).default
  }
}

/**
 * Creates a router-agnostic link that works in both App and Pages Router
 */
export function createRouterAgnosticLink(href: string, options = {}) {
  if (isPagesRouter()) {
    const { Link } = require("next/link")
    return { Link, href, ...options }
  } else {
    const { Link } = require("next/link")
    return { Link, href, ...options }
  }
}
