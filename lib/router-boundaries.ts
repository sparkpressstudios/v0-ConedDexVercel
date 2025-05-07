/**
 * Defines clear boundaries between App Router and Pages Router code
 * This helps maintain separation of concerns and simplifies migration
 */
export const ROUTER_BOUNDARIES = {
  APP_ROUTER: ["app/**/*", "components/ui/**/*", "lib/actions/**/*"],
  PAGES_ROUTER: ["pages/**/*", "components/pages-*/**/*", "lib/pages-*/**/*"],
  SHARED: ["components/shared/**/*", "lib/utils/**/*", "lib/types/**/*"],
}

/**
 * Lists components that need to be migrated from Pages to App Router
 */
export const COMPONENT_MIGRATION_MAP = {
  // Layout components
  "components/pages-layout.tsx": "components/app/layout.tsx",
  "components/pages-auth-components.tsx": "components/app/auth-components.tsx",
  "components/dashboard/pages-dashboard-layout.tsx": "components/app/dashboard-layout.tsx",

  // Feature components
  "components/flavor/flavor-detail-view.tsx": "components/app/flavor/flavor-detail-view.tsx",
  "components/shop/shop-dashboard.tsx": "components/app/shop/shop-dashboard.tsx",

  // Add more components as needed
}
